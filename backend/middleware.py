from fastapi import Request, HTTPException
from functools import wraps

def admin_only(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        request = kwargs.get('request')
        if request:
            user_role = request.headers.get('X-User-Role', 'user')
            if user_role != 'admin':
                raise HTTPException(status_code=403, detail="Admin access required")
        return func(*args, **kwargs)
    return wrapper

def editor_or_admin(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        request = kwargs.get('request')
        if request:
            user_role = request.headers.get('X-User-Role', 'user')
            if user_role not in ['admin', 'editor']:
                raise HTTPException(status_code=403, detail="Editor or admin access required")
        return func(*args, **kwargs)
    return wrapper