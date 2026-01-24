import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // 1. Extract token
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");

      // 3. Add user info to request
      // We add both 'id' and '_id' to ensure the controller finds it regardless of which one it looks for
      req.user = {
        id: decoded.id,
        _id: decoded.id, 
        userType: decoded.userType,
      };

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

// Role-based middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if req.user exists and if their role is allowed
    if (!req.user || !roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `User type '${req.user?.userType || 'unknown'}' is not authorized to access this route`,
      });
    }
    next();
  };
};