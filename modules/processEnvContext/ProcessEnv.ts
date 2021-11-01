export async function grabProcessEnvironmentVariables(): Promise<{ [key: string]: string }> {
	return process.env;
}
