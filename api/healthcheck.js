const request = await fetch("http://127.0.0.1:3000/api/health");
if (!request.ok) process.exit(1);

