// URL safe variant of Base-64
function b64(str) {
	return Buffer.from(str)
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}
function encode(header, payload) {
	const headerEnc = b64(JSON.stringify(header));
	const payloadEnc = b64(JSON.stringify(payload));
	return `${headerEnc}.${payloadEnc}`;
}
function decode(jwt) {
	const [headerB64, payloadB64] = jwt.split(".");
	const headerStr = Buffer.from(headerB64, "base64").toString("ascii");
	const payloadStr = Buffer.from(payloadB64, "base64").toString("ascii");
	return {
		header: JSON.parse(headerStr),
		payload: JSON.parse(payloadStr),
	};
}

export function encodeUserData(email, username) {
	const header = {
		alg: "none",
	};
	const payload = {
		sub: email,
		name: username,
	};

	return encode(header, payload);
}
