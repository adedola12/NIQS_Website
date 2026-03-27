// Role-based access control middleware
// Usage: roleCheck('main_admin', 'national_admin')

const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Check if state_admin can only access their own chapter
const chapterScope = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  // Main admin and national admin can access all chapters
  if (req.admin.role === 'main_admin' || req.admin.role === 'national_admin') {
    return next();
  }

  // State admin — check if the chapter in the request matches their assigned chapter
  const requestChapter = req.body.chapter || req.params.chapterId || req.query.chapter;

  if (req.admin.role === 'state_admin') {
    if (!req.admin.assignedChapter) {
      return res.status(403).json({ message: 'No chapter assigned to this admin' });
    }

    if (requestChapter && requestChapter.toString() !== req.admin.assignedChapter.toString()) {
      return res.status(403).json({ message: 'You can only manage your assigned chapter' });
    }

    // Auto-set chapter for state admins if not provided
    if (!requestChapter && req.body) {
      req.body.chapter = req.admin.assignedChapter;
      req.body.scope = 'chapter';
    }
  }

  next();
};

// Check scope: national admins can't delete, only main admin can
const deleteCheck = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.admin.role !== 'main_admin') {
    return res.status(403).json({ message: 'Only Main Admin can delete content' });
  }

  next();
};

module.exports = { roleCheck, chapterScope, deleteCheck };
