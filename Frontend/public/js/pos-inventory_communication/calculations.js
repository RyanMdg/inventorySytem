// "strict";

// import { getAuthUserAndBranch } from "../Authentication/auth-utils.js";

// import supabase from "../../Backend2/config/SupabaseClient.js";

// const calculation = document.querySelectorAll(".complete-btn");

// document.addEventListener("DOMContentLoaded", function () {
//   calculation.addEventListener("click", async function () {
//     const { branchId } = await getAuthUserAndBranch();
//     const mixture_total = 0;

//     const { data: reciept, error: recieptError } = await supabase
//       .from("pos_orders_table")
//       .select("receipt_number,quantity")
//       .eq("branch_id", branchId);

//     if (reciept) {
//       console.log("succesfully fetch data");
//     }

//     if (recieptError) {
//       console.log("error fetching ", recieptError.message);
//     }

//     const { data: mixture, error: mixtureError } = await supabase
//       .from("mixtures_table")
//       .select("total")
//       .eq("branch_id", branchId);

//     if (mixture) {
//       console.log("succesfully fetch data");
//     }

//     if (mixtureError) {
//       console.log("error fetching ", recieptError.message);
//     }

//     mixture.forEach((item) => {
//       item.total += mixture_total;
//     });

//     console.log(sumUpRaw(mixture_total, reciept.quantity));
//   });
// });

// const sumUpRaw = (expensesRaw, quantity) => {
//   const pricePerBall = 3.285;

//   const sum = pricePerBall * quantity;

//   return expensesRaw - sum;
// };
