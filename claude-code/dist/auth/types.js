/**
 * Authentication Types
 *
 * Type definitions for authentication functionality.
 */
/**
 * Authentication methods
 */
export var AuthMethod;
(function (AuthMethod) {
    /**
     * API key authentication
     */
    AuthMethod["API_KEY"] = "api_key";
    /**
     * OAuth authentication
     */
    AuthMethod["OAUTH"] = "oauth";
})(AuthMethod || (AuthMethod = {}));
export var AuthState;
(function (AuthState) {
    AuthState["INITIAL"] = "initial";
    AuthState["AUTHENTICATING"] = "authenticating";
    AuthState["AUTHENTICATED"] = "authenticated";
    AuthState["FAILED"] = "failed";
    AuthState["REFRESHING"] = "refreshing";
    AuthState["EXPIRED"] = "expired";
    AuthState["UNAUTHENTICATED"] = "unauthenticated";
})(AuthState || (AuthState = {}));
//# sourceMappingURL=types.js.map