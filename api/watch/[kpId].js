import axios from "axios";

export default async function handler(req, res) {
    const { kpId } = req.query;

    try {
        const { data } = await axios.get("https://api.alloha.tv/", {
            params: {
                token: process.env.ALLOHA_TOKEN,
                kp: kpId,
            },
        });

        res.json(data); // пока просто сырой ответ Alloha
    } catch (e) {
        console.error("alloha error:", e); // уйдет в Vercel Logs
        res.status(500).json({
            error: "internal_error",
            message: String(e?.message),
        });
    }
}
