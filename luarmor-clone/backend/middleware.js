const AuthenticationManager = require('./authentication');

/**
 * Middleware zur JWT Token Verifizierung
 */
function verifyToken(authManager) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authHeader.substring(7);
      const user = await authManager.verifyToken(token);

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };
}

/**
 * Middleware für Admin-Prüfung
 */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
}

/**
 * Middleware für Request-Logging
 */
function logRequest(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);
  next();
}

/**
 * Middleware für Error-Handling
 */
function errorHandler(err, req, res, next) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error:`, err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    timestamp
  });
}

/**
 * Rate Limiting Middleware (einfache Implementierung)
 */
function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    // Entferne alte Requests außerhalb des Fensters
    const userRequests = requests.get(ip);
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }

    recentRequests.push(now);
    requests.set(ip, recentRequests);

    next();
  };
}

/**
 * CORS Middleware
 */
function corsMiddleware(allowedOrigins = ['http://localhost:3000']) {
  return (req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireAdmin,
  logRequest,
  errorHandler,
  rateLimit,
  corsMiddleware
};
