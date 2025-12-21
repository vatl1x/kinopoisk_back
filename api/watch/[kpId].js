import axios from "axios";

export default async function handler(req, res) {
    const { kpId } = req.query;

    // ВРЕМЕННО: проверить, есть ли токен на Vercel
    if (!process.env.ALLOHA_TOKEN) {
        return res.status(500).json({
            error: "no_token",
            hasToken: Boolean(process.env.ALLOHA_TOKEN),
        });
    }

    try {
        const { data } = await axios.get("https://api.alloha.tv/", {
            params: {
                token: process.env.ALLOHA_TOKEN,
                kp: kpId,
            },
        });

        if (data.status !== "success" || !data.data) {
            return res.status(404).json({ error: "not_found_in_alloha" });
        }

        const movie = data.data;
        const list = Object.values(movie.translation_iframe || {});
        const dub = list.find((t) => t.name?.includes("Дублирован")) || list[0];
        const iframeUrl = dub?.iframe || movie.iframe;

        if (!iframeUrl)
            return res.status(404).json({ error: "no_iframe_found" });

        res.json(data);
    } catch (e) {
        res.status(500).json({
            error: "internal_error",
            message: String(e?.message),
        });
    }
}
