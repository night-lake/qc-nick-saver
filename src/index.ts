export default {
	async fetch(request: Request, env: { nicks: KVNamespace }) {
		let res: Response = new Response();

		if (!["POST", "GET", "OPTIONS"].includes(request.method)) {
			res = new Response(
				JSON.stringify({ err: "No such method is allowed." }),
				{ status: 405 }
			);
		}

		if (request.method === "OPTIONS") {
			res = new Response("", { status: 200 });

			res.headers.set("Access-Control-Allow-Origin", "*");
			res.headers.set("Access-Control-Allow-Headers", "*");

			return res;
		}

		try {
			const { pathname } = new URL(request.url);

			if (pathname.startsWith("/nick")) {
				if (request.method === "GET") {
					const key = pathname.split("/")[2];
					console.log(key);

					if (key) {
						const data = await env.nicks.get(key);

						if (data) {
							res = new Response(
								JSON.stringify({ nick: JSON.parse(data).nick }),
								{
									status: 200,
								}
							);
						} else {
							res = new Response(
								JSON.stringify({
									err: "No such nickname exists.",
								}),
								{ status: 404 }
							);
						}
					}
				} else {
					const body = await request.json<{ nick: string }>();
					const [, id] = Math.random().toString(36).split(".");

					await env.nicks.put(
						id,
						JSON.stringify({ nick: body.nick ?? "NoNick" }),
						{
							expiration: Math.floor(
								Date.now() / 1000 + 1.5 * 12 * 30.4375 * 60 * 60
							),
						}
					);

					res = new Response(JSON.stringify({ id }), { status: 200 });
				}
			} else {
				res = new Response(
					JSON.stringify({ err: "No such route exists" }),
					{
						status: 404,
					}
				);
			}
		} catch (err: any) {
			console.error(err);
			res = new Response(
				JSON.stringify({ err: err.message ?? err.stack }),
				{
					status: 500,
				}
			);
		}

		res.headers.set("Access-Control-Allow-Origin", "*");
		res.headers.set("Access-Control-Allow-Headers", "*");
		res.headers.set("Content-Type", "application/json");

		return res;
	},
};
