export const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const hasMilestones = (milestones) =>
  Array.isArray(milestones) && milestones.length > 0;

export const getMilestoneTotal = (milestones) =>
  Array.isArray(milestones)
    ? milestones.reduce((total, milestone) => {
        const value = Number(milestone?.value ?? 0);
        return total + (Number.isNaN(value) ? 0 : value);
      }, 0)
    : 0;

export const getCreatorLabel = (creatorAddress) =>
  creatorAddress?.name ||
  creatorAddress?.email ||
  creatorAddress ||
  "Unknown Creator";
