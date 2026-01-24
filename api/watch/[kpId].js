// api/watch/[kpId].js
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export default async function handler(req, res) {
    // CORS (если фронт на другом домене)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "GET")
        return res.status(405).json({ error: "method_not_allowed" });

    const { kpId } = req.query;

    if (!kpId) return res.status(400).json({ error: "kpId_required" });
    if (!process.env.ALLOHA_TOKEN) {
        return res.status(500).json({ error: "no_token" });
    }

    try {
        const { data } = await axios.get("https://api.alloha.tv/", {
            params: {
                token: process.env.ALLOHA_TOKEN,
                kp: kpId,
            },
            timeout: 15000,
            httpsAgent,
        });

        if (data?.status !== "success" || !data?.data) {
            return res.status(404).json({ error: "not_found_in_alloha" });
        }

        const movie = data.data;
        const list = Object.values(movie.translation_iframe || {});
        const dub =
            list.find((t) => t?.name?.includes("Дублирован")) || list[0];
        const iframeUrl = dub?.iframe || movie.iframe;

        if (!iframeUrl)
            return res.status(404).json({ error: "no_iframe_found" });

        return res.json({
            kpId,
            title: movie.name,
            year: movie.year,
            iframeUrl,
        });
    } catch (e) {
        return res.status(500).json({
            error: "internal_error",
            message: e?.message,
            code: e?.code,
            url: e?.config?.url,
            method: e?.config?.method,
            host: e?.request?.host,
        });
    }
}
