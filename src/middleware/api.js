const authenticateKey = (req, res, next) => {
  const apiKey = req.header('Token');

  if (apiKey === process.env.API_KEY) {
    next();
  } else {
    // Reject request if API key doesn't match
    console.log(`${new Date().toISOString()} - API: Request not authorized.`);
    res.status(403).send({ error: { code: 403, message: 'Unauthorized.' } });
  }
};

module.exports = { authenticateKey };
