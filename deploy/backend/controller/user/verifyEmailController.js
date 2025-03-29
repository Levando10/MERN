const userModel = require("../../models/userModel");

async function verifyEmailController(req, res) {
  try {
    const { token } = req.params;

    const user = await userModel.findOne({ verificationToken: token });

    if (!user) {
      res.setHeader("Content-Type", "text/html");
      return res.status(400).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            </head>
            <body>
                <script>
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid Token',
                        text: 'The verification link is invalid or has already been used.',
                        confirmButtonText: 'Resend Verification Email'
                    }).then(() => {
                        window.location.href = 'http://localhost:3000/resend-verification';
                    });
                </script>
            </body>
            </html>
        `);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verified</title>
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        </head>
        <body>
            <script>
                Swal.fire({
                    icon: 'success',
                    title: 'Email Verified!',
                    text: 'Your email has been successfully verified. You can now log in.',
                    confirmButtonText: 'Go to Login'
                }).then(() => {
                    window.location.href = 'http://localhost:3000/login';
                });
            </script>
        </body>
        </html>
    `);
  } catch (err) {
    res.setHeader("Content-Type", "text/html");
    res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error</title>
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        </head>
        <body>
            <script>
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Something went wrong: ${err.message}',
                    confirmButtonText: 'Contact Support'
                }).then(() => {
                    window.location.href = 'http://localhost:3000/contact-support';
                });
            </script>
        </body>
        </html>
    `);
  }
}

module.exports = verifyEmailController;
