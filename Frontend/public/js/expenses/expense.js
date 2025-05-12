import supabase from "../../Backend2/config/SupabaseClient.js";
import { dynamicAlert } from "../modals_Js/dynamicInventory.js";

const expenseForm = document.getElementById("expenseForm");
const expensesTableBody = document.getElementById("expensesTableBody");
const typeDropdown = document.getElementById("typeofexpense");
const otherTypeInput = document.getElementById("otherTypeInput");
const totalExpensesElem = document.getElementById("totalExpenses");
const totalExpensesFilter = document.getElementById("totalExpensesFilter");

// Show/hide custom type input
if (typeDropdown) {
  typeDropdown.addEventListener("change", () => {
    if (typeDropdown.value === "others") {
      otherTypeInput.style.display = "block";
    } else {
      otherTypeInput.style.display = "none";
    }
  });
}

// Handle form submission
if (expenseForm) {
  expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = expenseForm.elements["name"].value;
    const price = parseFloat(expenseForm.elements["price"].value);
    let typeofexpense = typeDropdown.value;
    if (typeofexpense === "others") {
      typeofexpense = otherTypeInput.value;
    }
    if (!name || isNaN(price) || !typeofexpense) {
      dynamicAlert("Error", "Please fill in all fields correctly.");
      return;
    }
    const { error } = await supabase
      .from("expenses_table")
      .insert({ name, price, typeofexpense });
    if (error) {
      dynamicAlert("Error", error.message || "Failed to add expense");
    } else {
      dynamicAlert("Success", "Expense added successfully");
      expenseForm.reset();
      otherTypeInput.style.display = "none";
      fetchExpenses();
      fetchTotalExpenses(totalExpensesFilter ? totalExpensesFilter.value : "today");
    }
  });
}

// Fetch and display expenses
export async function fetchExpenses() {
  const { data, error } = await supabase
    .from("expenses_table")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    dynamicAlert("Error", error.message || "Failed to fetch expenses");
    return;
  }
  if (expensesTableBody) {
    expensesTableBody.innerHTML = data.map(exp => `
      <tr>
        <td>${exp.name}</td>
        <td>${exp.price}</td>
        <td>${exp.typeofexpense}</td>
      </tr>
    `).join("");
  }
}

// Fetch and display total expenses based on filter
totalExpensesFilter && totalExpensesFilter.addEventListener("change", (e) => {
  fetchTotalExpenses(e.target.value);
});

export async function fetchTotalExpenses(filter = "today") {
  let fromDate;
  const now = new Date();
  if (filter === "today") {
    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (filter === "week") {
    const day = now.getDay();
    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  } else if (filter === "month") {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    fromDate = null; // all time
  }

  let query = supabase.from("expenses_table").select("price,created_at");
  if (fromDate) {
    query = query.gte("created_at", fromDate.toISOString());
  }
  const { data, error } = await query;
  if (error) {
    if (totalExpensesElem) totalExpensesElem.textContent = "₱0.00";
    return;
  }
  const total = data.reduce((sum, exp) => sum + (parseFloat(exp.price) || 0), 0);
  if (totalExpensesElem) {
    totalExpensesElem.textContent = `₱${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }
}

// Initial fetch
fetchExpenses();
if (totalExpensesFilter) {
  fetchTotalExpenses(totalExpensesFilter.value);
} 