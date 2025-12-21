export default async function handler(req, res) {
    const { kpId } = req.query;

    return res.status(200).json({
        ok: true,
        kpId,
        vercelEnv: process.env.VERCEL_ENV,
        vercelUrl: process.env.VERCEL_URL,
        hasToken: Boolean(process.env.ALLOHA_TOKEN),
        tokenLen: process.env.ALLOHA_TOKEN?.length ?? 0,
    });
}
