---
name: secure-coding-kr
description: Apply secure coding principles based on the Korean Ministry of the Interior and Safety (MOIS) Software Development Security Guide (2021). Always use this skill for every coding task — writing functions, scripts, APIs, queries, authentication, file handling, error handling, or any other code, regardless of language or size. Never skip this skill when writing or reviewing code.
---
 
# Secure Coding Skill (MOIS Software Development Security Guide 2021)
 
This skill covers 7 vulnerability categories and 47 items from the Korean MOIS guide.
Apply all relevant items to every piece of code written.
 
---
 
## Annotation Rules
 
### Inline [SECURE] comments
Add a `[SECURE]` tag on every line where a security control is applied. Briefly state what and why.
 
```python
# [SECURE] Parameterized query - prevents SQL Injection (Category 1)
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```
 
Rules:
- No icons or emoji inside comments — plain text only
- Tag must be exactly `[SECURE]` (uppercase, brackets)
- Keep to one line
 
### Security Checklist at bottom of every code block
 
```
# --------------------------------------------------
# Security Checklist
# Applied:
#   - [vulnerability name]: [what was done]
# Not Applied:
#   - [WARN] [vulnerability name]: [why skipped and what to do]
# --------------------------------------------------
```
 
Rules:
- No icons or emoji — plain text only
- Missing controls must always be listed with [WARN]
- Never omit known security gaps
 
---
 
## Category 1: Input Data Validation and Representation (17 items)
 
Caused by missing or insufficient validation of program input values.
 
| Item | Key Defense |
|------|-------------|
| SQL Injection | Use PreparedStatement / parameterized binding. In MyBatis use # not $ |
| Code Injection | Never use eval() or dynamic code execution on user input. Whitelist-only input |
| Path Traversal | Filter path traversal chars (/ \ ..). Only allow paths from a predefined list |
| XSS | HTML-encode all output. Use OWASP Java Encoder, DOMPurify, html.escape() |
| OS Command Injection | Never pass user input directly to shell commands. Use a predefined command whitelist |
| Dangerous File Upload | Whitelist-based extension check. Rename file to unpredictable string. Store outside web root |
| Open Redirect | Manage allowed redirect URLs/domains as a whitelist. Never use raw input as redirect target |
| XXE | Disable external entity processing in XML parsers |
| XML Injection | Escape special characters in XML output |
| LDAP Injection | Escape LDAP query parameters |
| CSRF | Apply token-based CSRF protection. Re-verify identity for sensitive operations |
| SSRF | Restrict server-side URL access to a whitelist |
| HTTP Response Splitting | Strip CR/LF (\r\n) from user input before setting HTTP headers |
| Integer Overflow | Check value range before arithmetic. Use safe integer libraries |
| Improper Input for Security Decision | Never use client-supplied input directly for auth or access control decisions |
| Memory Buffer Overflow | Validate buffer bounds. Use safe string functions (strncpy, snprintf) |
| Format String Injection | Never pass user input as a format string argument (e.g. printf(user_input) is forbidden) |
 
**Code patterns:**
 
```python
# [SECURE] Parameterized query - SQL Injection prevention
cursor.execute("SELECT * FROM board WHERE gubun = %s", (gubun,))
 
# [SECURE] Whitelist path validation - Path Traversal prevention
ALLOWED_FILES = {"report.pdf", "guide.txt"}
if filename not in ALLOWED_FILES:
    raise ValueError("File not permitted.")
 
# [SECURE] Output encoding - XSS prevention
import html
safe_output = html.escape(user_input)
 
# [SECURE] Whitelist redirect validation - Open Redirect prevention
ALLOWED_REDIRECTS = ["/main", "/login", "/list"]
if redirect_url not in ALLOWED_REDIRECTS:
    redirect_url = "/main"
```
 
---
 
## Category 2: Security Features (16 items)
 
Caused by improper implementation of authentication, access control, cryptography, and key management.
 
| Item | Key Defense |
|------|-------------|
| Missing Auth for Critical Function | Re-authenticate on the server side for sensitive operations (transfers, profile edits) |
| Improper Authorization | Check ACL against session user before every operation. Verify requester matches session user |
| Incorrect Permission on Critical Resource | Apply least privilege. Config/executable files readable only by owner |
| Weak Cryptographic Algorithm | Do not use RC2/RC4/DES/MD5/SHA1. Use AES-256, SHA-256 or stronger |
| Unencrypted Sensitive Data | Encrypt data at rest and in transit. Transmit passwords over HTTPS only |
| Hard-coded Credentials | Never store passwords or keys as constants in source code. Use encrypted files or env vars |
| Insufficient Key Length | RSA: minimum 2048 bits. Symmetric: minimum 128 bits |
| Improper Random Value | Never use Random() or Math.random() for security decisions. Use SecureRandom / os.urandom() / secrets |
| Weak Password Policy | Require mix of letters, numbers, special chars, minimum 8 characters |
| Improper Certificate Validation | Never disable SSL/TLS certificate verification |
| Cookie Information Exposure | Do not store sensitive data in cookies. Set HttpOnly and Secure attributes |
| Sensitive Info in Comments | Never put passwords, internal server addresses, or auth keys in code comments |
| Hash Without Salt | Always apply a unique salt when hashing passwords. Use bcrypt, argon2, or scrypt |
| Code Download Without Integrity Check | Verify hash/signature of externally downloaded code before execution |
| Missing Rate Limit on Auth | Implement login attempt limiting and account lockout policy |
 
**Code patterns:**
 
```python
import bcrypt
import secrets
import os
 
# [SECURE] bcrypt with salt - prevents rainbow table and timing attacks
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
 
# [SECURE] Cryptographically secure random token - prevents predictable token attack
token = secrets.token_hex(32)
 
# [SECURE] Load secret from environment variable - prevents hard-coded credentials
db_password = os.environ.get("DB_PASSWORD")
if not db_password:
    raise EnvironmentError("DB_PASSWORD environment variable is not set.")
 
# [SECURE] AES-256 via Fernet - prevents weak cryptographic algorithm
from cryptography.fernet import Fernet
key = Fernet.generate_key()
cipher = Fernet(key)
```
 
---
 
## Category 3: Time and State (2 items)
 
Caused by improper management of shared state in concurrent or parallel systems.
 
| Item | Key Defense |
|------|-------------|
| Race Condition (TOCTOU) | Use atomic operations. Create temp files in a safe directory with unpredictable names |
| Infinite Loop or Recursion | Always define a maximum iteration count or explicit termination condition |
 
**Code patterns:**
 
```python
import tempfile, os
 
# [SECURE] Atomic file write - prevents TOCTOU race condition
with tempfile.NamedTemporaryFile(delete=False, dir='/safe/tmp') as f:
    f.write(data)
    tmp_path = f.name
os.replace(tmp_path, target_path)
 
# [SECURE] Max retry cap - prevents infinite loop
MAX_RETRY = 5
for attempt in range(MAX_RETRY):
    if condition_met():
        break
```
 
---
 
## Category 4: Error Handling (3 items)
 
Caused by missing or insufficient error handling that exposes internal system information.
 
| Item | Key Defense |
|------|-------------|
| Error Message Information Exposure | Never expose stack traces, DB structure, or server paths to users. Return a generic message |
| Missing Error Handling | Write handling logic for every exception path |
| Improper Exception Handling | Never use an empty catch/except block. Never silently swallow exceptions |
 
**Code patterns:**
 
```python
import logging
logger = logging.getLogger(__name__)
 
try:
    result = db.query(sql)
except DatabaseError as e:
    # [SECURE] Log full error server-side only - prevents error message information exposure
    logger.error("DB error: %s", e)
    # [SECURE] Return generic message to user - no internal detail exposed
    return {"error": "Request could not be processed. Please try again later."}
```
 
---
 
## Category 5: Code Errors (5 items)
 
Caused by common programming mistakes that create exploitable conditions.
 
| Item | Key Defense |
|------|-------------|
| Null Pointer Dereference | Check for null/None before accessing object members |
| Improper Resource Release | Always release files, DB connections, sockets. Use try-finally or context managers |
| Use After Free | Never access a variable after the resource it references has been released |
| Uninitialized Variable | Initialize all variables at declaration |
| Unsafe Deserialization | Never deserialize externally received data without integrity verification first |
 
**Code patterns:**
 
```python
# [SECURE] Context manager ensures resource release - prevents improper resource release
with open(filepath, 'r') as f:
    data = f.read()
 
# [SECURE] Null check before use - prevents null pointer dereference
user = get_user(user_id)
if user is None:
    return {"error": "User not found."}
 
# [SECURE] HMAC integrity check before deserialization - prevents unsafe deserialization
import hmac, json
expected_sig = hmac.new(secret_key, raw_data, 'sha256').hexdigest()
if not hmac.compare_digest(expected_sig, received_sig):
    raise ValueError("Integrity check failed.")
payload = json.loads(raw_data)
```
 
---
 
## Category 6: Encapsulation (4 items)
 
Caused by insufficient encapsulation of data or functionality.
 
| Item | Key Defense |
|------|-------------|
| Data Exposure via Wrong Session | In multi-threaded environments, never store session data in singleton member variables |
| Leftover Debug Code | Remove all debug code, test accounts, and dev-only logs before production deployment |
| Private Array Returned from Public Method | Return a copy of internal arrays, not a direct reference |
| Public Data Assigned to Private Array | Never assign external input directly into an internal private array |
 
**Code patterns:**
 
```python
class UserService:
    def __init__(self):
        self._permissions = ["read", "write"]
 
    # [SECURE] Return copy - prevents private array direct exposure
    def get_permissions(self):
        return list(self._permissions)
 
    # [SECURE] Assign copy - prevents public data assigned to private array
    def set_permissions(self, perms):
        self._permissions = list(perms)
```
 
---
 
## Category 7: API Misuse (2 items)
 
Caused by using APIs in ways that violate their intended security contract.
 
| Item | Key Defense |
|------|-------------|
| Security Decision Based on DNS Lookup | Never trust DNS query results for auth or access control. Validate IP addresses directly |
| Use of Vulnerable API | Use current, security-vetted APIs. Replace all deprecated security-related APIs |
 
---
 
## Language Quick Reference
 
| Language | SQL Injection | Password Hash | Secure Random | XSS Output |
|----------|--------------|---------------|---------------|------------|
| Python | cursor.execute("... %s", (val,)) | bcrypt / argon2 | secrets.token_hex() | html.escape() |
| Java | PreparedStatement | BCrypt (Spring Security) | SecureRandom | OWASP Java Encoder |
| JavaScript | ORM parameterized / pg ? | bcrypt | crypto.randomBytes() | DOMPurify |
| C# | SqlCommand + Parameters | BCrypt.Net | RNGCryptoServiceProvider | HttpUtility.HtmlEncode |
| C | Never use strcat with user input | libsodium | /dev/urandom | Filter before output |
| MyBatis | #{param} only (never ${param}) | - | - | - |
 
---
 
## Absolute Rules (Never Violate)
 
- Never hard-code passwords, API keys, or crypto keys as constants in source code
- Never concatenate user input directly into SQL queries
- Never use RC2, RC4, DES, MD5, or SHA1 for security purposes
- Never generate RSA keys shorter than 2048 bits
- Never expose stack traces, DB errors, or server paths to end users
- Never use an empty catch/except block
- Never open files or DB connections without a guaranteed release path
- Never deserialize external data without integrity verification
- Never use Random() or Math.random() for security-critical randomness
- Never put credentials or internal addresses in code comments
- Never grant world-readable/writable permissions (e.g. chmod 777) to sensitive files
- Never leave debug code or test accounts in production
 
