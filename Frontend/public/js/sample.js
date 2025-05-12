// // Takoyaki Costing Calculator
// // Dynamically calculates cost per ball based on ingredient prices and usage

// // Example ingredients table (customize as needed)
// const ingredientsTable = [
//   { ingredient: "Flour", totalUsed: 5, pricePerUnit: 80 }, // 5 units at ₱80 each
//   { ingredient: "Egg", totalUsed: 1, pricePerUnit: 210 },
//   { ingredient: "Sauce", totalUsed: 0.75, pricePerUnit: 390 },
//   { ingredient: "Cheese Sauce", totalUsed: 1, pricePerUnit: 94 },
//   { ingredient: "Octo", totalUsed: 0.75, pricePerUnit: 250 },
//   { ingredient: "Ham", totalUsed: 1, pricePerUnit: 160 },
//   { ingredient: "Cheese Cubes", totalUsed: 5, pricePerUnit: 107 },
//   { ingredient: "Mayo", totalUsed: 1.5, pricePerUnit: 100 },
//   { ingredient: "Toppings", totalUsed: 1, pricePerUnit: 50 },
//   { ingredient: "Oil", totalUsed: 0.5, pricePerUnit: 67 },
//   { ingredient: "Gas", totalUsed: 1, pricePerUnit: 90 },
//   { ingredient: "Styro's / Cup", totalUsed: 1, pricePerUnit: 120 },
//   { ingredient: "Veggies", totalUsed: 0.5, pricePerUnit: 60 },
//   { ingredient: "Leeks", totalUsed: 0.25, pricePerUnit: 120 },
//   { ingredient: "Garlic", totalUsed: 1, pricePerUnit: 20 },
//   { ingredient: "Powder Shrimp", totalUsed: 0.1, pricePerUnit: 350 },
// ];

// const ballsPerBatch = 742; // Base batch size

// function calculateTotalBatchCost(tableData) {
//   let totalCost = 0;
//   tableData.forEach((item) => {
//     totalCost += item.totalUsed * item.pricePerUnit;
//   });
//   return totalCost;
// }

// function calculateDynamicCostPerBall(tableData, ballsPerBatch) {
//   const totalBatchCost = calculateTotalBatchCost(tableData);
//   return (totalBatchCost / ballsPerBatch).toFixed(2);
// }

// // Example usage:
// const dynamicCostPerBall = calculateDynamicCostPerBall(
//   ingredientsTable,
//   ballsPerBatch
// );
// console.log("Dynamic Cost Per Ball:", dynamicCostPerBall); // Output: e.g. 3.29

// // If you want to update an ingredient price or usage:
// function updateIngredient(
//   tableData,
//   ingredientName,
//   newPricePerUnit,
//   newTotalUsed
// ) {
//   const item = tableData.find((row) => row.ingredient === ingredientName);
//   if (item) {
//     if (newPricePerUnit !== undefined) item.pricePerUnit = newPricePerUnit;
//     if (newTotalUsed !== undefined) item.totalUsed = newTotalUsed;
//   }
// }

// // Example: update flour price to 100
// updateIngredient(ingredientsTable, "Flour", 80);
// const newDynamicCostPerBall = calculateDynamicCostPerBall(
//   ingredientsTable,
//   ballsPerBatch
// );
// console.log("Updated Dynamic Cost Per Ball:", newDynamicCostPerBall);

// // MENU PRICES (per serving size)
// const menuPrices = {
//   OCTO: { "4s": 45, "8s": 80, "12s": 125, "16s": 160 },
//   "HAM & CHEESE": { "4s": 45, "8s": 80, "12s": 125, "16s": 160 },
//   CHEESE: { "8s": 80, "12s": 125, "16s": 160 },
//   "MIX #3": { "8s": 80, "12s": 125, "16s": 160 },
//   TAKOPARTY: { "20s": 205, "42s": 450 },
// };

// // SERVING SIZES (number of balls per serving)
// const servingSizes = {
//   "4s": 4,
//   "8s": 8,
//   "12s": 12,
//   "16s": 16,
//   "20s": 20,
//   "42s": 42,
// };

// // Calculate profit margin for each menu item and serving size
// function calculateProfitPerServing(costPerBall, menuPrice, ballsPerServing) {
//   const totalCost = costPerBall * ballsPerServing;
//   const profit = menuPrice - totalCost;
//   const profitMargin = (profit / menuPrice) * 100;
//   return {
//     totalCost: totalCost.toFixed(2),
//     profit: profit.toFixed(2),
//     profitMargin: profitMargin.toFixed(2) + "%",
//   };
// }

// // Display profit margins for all menu items and sizes
// function displayProfitMargins(costPerBall) {
//   Object.keys(menuPrices).forEach((variant) => {
//     console.log(`\n${variant}`);
//     Object.keys(menuPrices[variant]).forEach((size) => {
//       const menuPrice = menuPrices[variant][size];
//       const balls = servingSizes[size];
//       if (!balls) return;
//       const { totalCost, profit, profitMargin } = calculateProfitPerServing(
//         costPerBall,
//         menuPrice,
//         balls
//       );
//       console.log(
//         `  ${size}: Menu Price = ₱${menuPrice}, Cost = ₱${totalCost}, Profit = ₱${profit}, Margin = ${profitMargin}`
//       );
//     });
//   });
// }

// // Example usage:
// displayProfitMargins(parseFloat(dynamicCostPerBall));
