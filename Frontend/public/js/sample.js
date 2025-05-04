function computeIngredientCost(ingredientName, newTotalUsed, tableData) {
  const item = tableData.find((row) => row.ingredient === ingredientName);
  if (!item) return `Ingredient "${ingredientName}" not found.`;

  const originalTotalUsed = parseFloat(item.totalUsedInGrams);
  const originalUsedPerBall = parseFloat(item.usedPerBallInGrams);
  const totalPrice = item.totalPrice; // in ₱

  const pricePerUnit = totalPrice / originalTotalUsed;
  const newUsedPerBall =
    (originalUsedPerBall / originalTotalUsed) * newTotalUsed;
  const newCostPerBall = newUsedPerBall * pricePerUnit;

  return {
    ingredient: ingredientName,
    usedPerBall: `${newUsedPerBall.toFixed(2)}g`,
    pricePerUnit: `₱${pricePerUnit.toFixed(2)}`,
    costPerBall: `₱${newCostPerBall.toFixed(2)}`,
  };
}

const ballperday = 742;
const quantity = 6000;

const total = quantity / ballperday;
console.log(total);

const ingredientsTable = [
  {
    ingredient: "Flour",
    totalUsedInGrams: 6000,
    usedPerBallInGrams: total,
    totalPrice: 480, // ₱0.08 per gram
  },
  {
    ingredient: "Eggs",
    totalUsedInGrams: 30, // 1 egg = 1 unit
    usedPerBallInGrams: 0.04,
    totalPrice: 210, // ₱7 x 30
  },
  // Add more as needed...
];

const updated = computeIngredientCost("Flour", 6000, ingredientsTable);
console.log(updated);
