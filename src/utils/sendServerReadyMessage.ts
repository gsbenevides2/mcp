export const sendServerReadyMessage =
	(hideSwagger: boolean) => (server: Bun.Server) => {
		const url = new URL(server.url);
		console.log(`Server is ready 😀. Running on ${url.toString()}`);
		const swaggerUrl = new URL("/swagger", url.toString());
		if (!hideSwagger) {
			console.log(
				`📖 Swagger documentation is available on ${swaggerUrl.toString()}`,
			);
		}
	};
