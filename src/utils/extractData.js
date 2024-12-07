export const extractIdAndFriendlyName = (data) => {
  return data.map(item => ({
    value: item.id,
    label: item.friendlyName
  }));
};

// export const extractIdAndFriendlyName = (data) => {
//     return data.map(item => ({
//       id: item.id,
//       friendlyName: item.friendlyName
//     }));
//   };
  