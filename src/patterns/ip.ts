// IPv4 and IPv6 (simplified). IPv4: four octets; IPv6: hex groups with :
const ipv4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|1?\d\d?)\b/g;
const ipv6 =
	/\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b|\b::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}\b/g;

function combineRegex(...regices: RegExp[]): RegExp {
	const sources = regices.map((r) => r.source);
	return new RegExp(sources.join("|"), "g");
}

export const ipRegex = combineRegex(ipv4, ipv6);
export const ipName = "ip" as const;
