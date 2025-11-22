from .role_permissions import (
    IsSuperAdmin,
    IsAdminOrAbove,
    IsAdmin,
    IsUser,
    IsOwnerOrAdminOrAbove,
    CanManageUsers,
    CanChangeRole,
    ReadOnlyOrAdmin,
    # Hierarchical permissions
    CanViewInScope,
    CanManageInScope,
    CanCreateUsers,
    HasGeographicScope,
    IsAnalystOrAbove,
)

__all__ = [
    'IsSuperAdmin',
    'IsAdminOrAbove',
    'IsAdmin',
    'IsUser',
    'IsOwnerOrAdminOrAbove',
    'CanManageUsers',
    'CanChangeRole',
    'ReadOnlyOrAdmin',
    # Hierarchical permissions
    'CanViewInScope',
    'CanManageInScope',
    'CanCreateUsers',
    'HasGeographicScope',
    'IsAnalystOrAbove',
]
