const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

let buffer = '';

process.stdin.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const req = JSON.parse(line);
            
            if (req.method === 'initialize') {
                process.stdout.write(JSON.stringify({
                    jsonrpc: "2.0",
                    id: req.id,
                    result: {
                        protocolVersion: "2024-11-05",
                        capabilities: { tools: {} },
                        serverInfo: { name: "smtp-mcp", version: "1.0.0" }
                    }
                }) + '\n');
            } else if (req.method === 'tools/call') {
                const { name, arguments: args } = req.params;
                if (name === 'send_email') {
                    transporter.sendMail({
                        from: process.env.SMTP_USER,
                        to: args.to,
                        subject: args.subject,
                        text: args.text
                    }).then(info => {
                        process.stdout.write(JSON.stringify({
                            jsonrpc: "2.0",
                            id: req.id,
                            result: {
                                content: [{ type: "text", text: `Email sent successfully: ${info.messageId}` }]
                            }
                        }) + '\n');
                    }).catch(err => {
                        process.stdout.write(JSON.stringify({
                            jsonrpc: "2.0",
                            id: req.id,
                            error: { code: -32000, message: err.message }
                        }) + '\n');
                    });
                }
            }
        } catch (e) {
            // ignore
        }
    }
});
