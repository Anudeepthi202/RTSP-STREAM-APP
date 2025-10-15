from datetime import datetime
from bson import ObjectId

class Overlay:
    def __init__(self, name, type, content, position, size, created_at=None, _id=None):
        self._id = _id or ObjectId()
        self.name = name
        self.type = type  # 'text' or 'image'
        self.content = content  # text content or image URL
        self.position = position  # {x: number, y: number}
        self.size = size  # {width: number, height: number}
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': str(self._id),
            'name': self.name,
            'type': self.type,
            'content': self.content,
            'position': self.position,
            'size': self.size,
            'created_at': self.created_at.isoformat()
        }