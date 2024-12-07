// utils/getUsersByGroup.js
export const getUsersByGroupId = (data, groupId) => {
    const group = data.find((item) => item.id === groupId);
    if (!group || !group.memberDetails) return [];
  
    return group.memberDetails.map((detail) => ({
      id: detail.user.id,
      name: detail.user.name,
    }));
  };
  