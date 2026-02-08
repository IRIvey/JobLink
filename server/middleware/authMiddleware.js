import jwt from "jsonwebtoken";

// Protect middleware - to ensure that the user is authenticated
export const protect = async (req, res, next) => {
  let token;

  // Check if the request has an authorization header and if it's a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // 1. Extract token from the Authorization header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");

      // 3. Add user info (id, _id, userType) to the request object for downstream use
      req.user = {
        id: decoded.id,
        _id: decoded.id,
        userType: decoded.userType,  // e.g., 'admin', 'user', 'company'
      };

      // Proceed to the next middleware/route handler
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  // If no token is provided in the Authorization header
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

// Role-based middleware - to check user roles and authorize access based on the role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user is authenticated and if their role is allowed
    if (!req.user || !roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `User type '${req.user?.userType || 'unknown'}' is not authorized to access this route`,
      });
    }
    next();  // If the user has the correct role, proceed to the next middleware or route handler
  };
};

// Company-specific role-based middleware
export const authorizeCompany = (req, res, next) => {
  return authorizeRoles('company')(req, res, next);  // Only allow users with 'company' role
};
