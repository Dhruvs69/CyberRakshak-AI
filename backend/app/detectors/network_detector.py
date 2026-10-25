import csv
import io
import collections
from typing import Dict, Any, List

KNOWN_MALICIOUS_OR_SUSPICIOUS_PORTS = {
    4444: "Metasploit Default Listener / Reverse Shell",
    1337: "Elite / Common Backdoor Port",
    31337: "Back Orifice Trojan / Exploit Port",
    6667: "IRC (Internet Relay Chat) - Frequent Botnet C2",
    23: "Telnet (Insecure Plaintext Remote Access)",
    3389: "RDP (Remote Desktop) - Frequent Brute Force Target",
    8080: "Alternate HTTP Proxy / C2 Beaconing Channel",
    5555: "Android ADB Debugging Bridge / Mobile Worms",
    9999: "Urgent/Arbitrary Debug Port"
}

def analyze_network_flow_csv(csv_content: str, filename: str = "network_flow.csv") -> Dict[str, Any]:
    lines = csv_content.strip().splitlines()
    if not lines or len(lines) < 2:
        return {
            "risk_score": 0,
            "classification": "Low Risk",
            "total_records": 0,
            "anomalies": [],
            "traffic_summary": [],
            "protocol_distribution": {},
            "top_sources": [],
            "top_destinations": [],
            "explanation": "Insufficient information to determine risk confidently. CSV contains no data rows.",
            "recommendations": ["Upload a network flow CSV with headers: timestamp, src_ip, dst_ip, dst_port, protocol, bytes, packets, flags."],
            "is_simulation": True
        }

    # Detect delimiter: semicolon, tab, or comma
    sample_header = lines[0]
    delimiter = ","
    if ";" in sample_header and "," not in sample_header:
        delimiter = ";"
    elif "\t" in sample_header and "," not in sample_header:
        delimiter = "\t"

    reader = csv.DictReader(lines, delimiter=delimiter)
    # Normalize headers
    fieldnames = [f.strip().lower() for f in (reader.fieldnames or [])]
    
    # Map common header variations
    def get_val(row, *aliases):
        for alias in aliases:
            for k in row:
                if k.strip().lower() == alias:
                    return row[k].strip()
        return ""

    records = []
    src_conn_count = collections.defaultdict(int)
    src_dst_ports = collections.defaultdict(lambda: collections.defaultdict(set))
    src_bytes_count = collections.defaultdict(int)
    protocol_counts = collections.defaultdict(int)
    time_series_agg = collections.defaultdict(lambda: {"packets": 0, "bytes": 0})
    suspicious_port_hits = []

    for idx, row in enumerate(reader):
        src_ip = get_val(row, "src_ip", "source_ip", "src", "source") or "192.168.1.10"
        dst_ip = get_val(row, "dst_ip", "destination_ip", "dst", "destination") or "10.0.0.1"
        dst_port_raw = get_val(row, "dst_port", "dest_port", "port", "dport") or "80"
        protocol = (get_val(row, "protocol", "proto") or "TCP").upper()
        bytes_raw = get_val(row, "bytes", "length", "tot_bytes") or "100"
        packets_raw = get_val(row, "packets", "pkt_count") or "1"
        flags = get_val(row, "flags", "tcp_flags") or ""
        timestamp = get_val(row, "timestamp", "time", "date") or f"T{idx:02d}:00"

        try:
            dst_port = int(dst_port_raw)
        except ValueError:
            dst_port = 80
            
        try:
            byte_val = int(bytes_raw)
        except ValueError:
            byte_val = 100
            
        try:
            packet_val = int(packets_raw)
        except ValueError:
            packet_val = 1

        records.append({
            "timestamp": timestamp,
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "dst_port": dst_port,
            "protocol": protocol,
            "bytes": byte_val,
            "packets": packet_val,
            "flags": flags
        })

        src_conn_count[src_ip] += packet_val
        src_dst_ports[src_ip][dst_ip].add(dst_port)
        src_bytes_count[src_ip] += byte_val
        protocol_counts[protocol] += packet_val
        
        # Time-series aggregation (hourly or chronological)
        time_key = timestamp[:8] if len(timestamp) >= 8 else timestamp
        time_series_agg[time_key]["packets"] += packet_val
        time_series_agg[time_key]["bytes"] += byte_val

        # Check known suspicious ports
        if dst_port in KNOWN_MALICIOUS_OR_SUSPICIOUS_PORTS:
            suspicious_port_hits.append({
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "port": dst_port,
                "desc": KNOWN_MALICIOUS_OR_SUSPICIOUS_PORTS[dst_port]
            })

    total_records = len(records)
    anomalies: List[Dict[str, Any]] = []
    indicators: List[str] = []
    recommendations: List[str] = []
    score = 0

    # 1. Port Scanning Sweep Detection
    for src, dst_dict in src_dst_ports.items():
        for dst, ports in dst_dict.items():
            if len(ports) >= 6:
                sev = "High" if len(ports) >= 12 else "Medium"
                anomalies.append({
                    "type": "Port Scan / Reconnaissance Sweep",
                    "severity": sev,
                    "source": src,
                    "target": dst,
                    "unique_ports": len(ports),
                    "details": f"Source {src} probed {len(ports)} different destination ports on {dst} within the flow session."
                })
                indicators.append(f"Port scan reconnaissance detected: {src} -> {dst} across {len(ports)} target ports.")
                score += 35 if sev == "High" else 20

    # 2. Connection Frequency / SYN Flood Burst Detection
    for src, p_count in src_conn_count.items():
        if p_count > 1000 or (total_records > 0 and p_count / total_records > 0.6 and p_count > 100):
            anomalies.append({
                "type": "High Connection Frequency Burst / DoS Activity",
                "severity": "High",
                "source": src,
                "target": "Network",
                "details": f"Unusually high connection burst ({p_count} packets generated by single host {src})."
            })
            indicators.append(f"Abnormal traffic flood from {src} ({p_count} packets).")
            score += 30

    # 3. Data Exfiltration / Unusual Traffic Volume
    for src, b_count in src_bytes_count.items():
        if b_count > 5 * 1024 * 1024:  # > 5 MB in flow burst
            anomalies.append({
                "type": "High Data Volume / Exfiltration Spike",
                "severity": "Medium",
                "source": src,
                "target": "External Host",
                "details": f"Large egress payload transferred ({b_count / (1024*1024):.2f} MB) from internal host {src}."
            })
            indicators.append(f"Massive outbound traffic spike from {src}.")
            score += 25

    # 4. Malicious Port Interaction
    if suspicious_port_hits:
        unique_sus_ports = {hit["port"] for hit in suspicious_port_hits}
        for hit in suspicious_port_hits[:3]:
            anomalies.append({
                "type": "Suspicious Port Activity",
                "severity": "High",
                "source": hit["src_ip"],
                "target": f"{hit['dst_ip']}:{hit['port']}",
                "details": f"Connection directed to {hit['port']} ({hit['desc']})."
            })
        indicators.append(f"Traffic targeting known exploit/C2 ports: {', '.join(map(str, unique_sus_ports))}.")
        score += 35

    final_score = min(max(score, 0), 100)

    # Classify Risk
    if final_score >= 70:
        classification = "High Risk"
        explanation = (
            f"Critical network anomalies detected (Risk Score: {final_score}/100). "
            f"Found {len(anomalies)} distinct indicators matching reconnaissance or attack behaviors."
        )
        recommendations.extend([
            "Isolate the offending source IP address from internal network subnets.",
            "Inspect egress firewall logs and terminate connections to suspicious ports.",
            "Perform host-level forensic scan on the source machine for malware or unauthorized remote agents."
        ])
    elif final_score >= 30:
        classification = "Suspicious"
        explanation = (
            f"Suspicious network activity observed (Risk Score: {final_score}/100). "
            f"{len(anomalies)} anomalous pattern(s) identified which diverge from baseline traffic."
        )
        recommendations.extend([
            "Monitor traffic from the identified hosts for continued anomalies.",
            "Verify whether legitimate administrative scanning or backup activity accounts for this flow.",
            "Review firewall ingress rules for external facing services."
        ])
    else:
        classification = "Low Risk"
        explanation = (
            f"Network flow profile conforms to expected operational baselines (Risk Score: {final_score}/100). "
            "No port scans, abnormal traffic spikes, or known malicious port connections were found."
        )
        recommendations.extend([
            "Continue continuous telemetry monitoring.",
            "Maintain baseline audits of normal corporate or home subnet traffic."
        ])

    # Time series chart data formatting
    traffic_summary = [
        {"time": k, "packets": v["packets"], "bytes": v["bytes"]}
        for k, v in sorted(time_series_agg.items())
    ]

    top_sources = sorted([{"ip": ip, "count": cnt} for ip, cnt in src_conn_count.items()], key=lambda x: x["count"], reverse=True)[:5]
    top_destinations = sorted([{"ip": ip, "bytes": b} for ip, b in src_bytes_count.items()], key=lambda x: x["bytes"], reverse=True)[:5]

    return {
        "risk_score": final_score,
        "classification": classification,
        "total_records": total_records,
        "indicators": indicators if indicators else ["No network anomalies detected in flow sample."],
        "anomalies": anomalies,
        "traffic_summary": traffic_summary,
        "protocol_distribution": dict(protocol_counts),
        "top_sources": top_sources,
        "top_destinations": top_destinations,
        "explanation": explanation,
        "recommendations": list(dict.fromkeys(recommendations)),
        "is_simulation": True,
        "note": "Flow analysis performed locally on uploaded sample data. CyberRakshak AI does not perform intrusive network packet capture without explicit authorization."
    }
