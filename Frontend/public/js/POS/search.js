import supabase from "../../Backend2/config/SupabaseClient.js";

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#posSearch');
    const clearButton = document.querySelector('#clearSearch');
    
    if (searchInput && clearButton) {
        // Clear button functionality
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            handleSearch({ target: searchInput }); // Trigger search update
        });

        // Handle search input
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
});

// Debounce function to limit how often the search is performed
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const currentTab = document.querySelector('.text-red-600').textContent.trim();
    
    if (currentTab === 'Take Order') {
        await searchProducts(searchTerm);
    } else if (currentTab === 'Complete Order' || currentTab === 'Cancel Order') {
        await searchOrders(searchTerm);
    }
}

async function searchProducts(searchTerm) {
    try {
        // Get logged-in user's branch_id
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError) throw new Error(authError.message);

        const { data: userBranch, error: userError } = await supabase
            .from('users_table')
            .select('branch_id')
            .eq('id', userData.user.id)
            .single();
        if (userError) throw new Error(userError.message);

        const takeorderContainer = document.getElementById('takeorderContainer');
        
        // If search is empty, show all products
        if (!searchTerm) {
            const { data: allProducts } = await supabase
                .from('products_table')
                .select('*');
            displayProducts(allProducts);
            return;
        }

        // Fetch products based on search term
        const { data: products, error: productsError } = await supabase
            .from('products_table')
            .select('*')
            .ilike('product_name', `%${searchTerm}%`);

        if (productsError) throw new Error(productsError.message);

        // Display "No results found" if no products match
        if (products.length === 0) {
            takeorderContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center w-full">
                    <p class="text-gray-500 text-lg">No products found matching "${searchTerm}"</p>
                </div>
            `;
            return;
        }

        displayProducts(products);

    } catch (error) {
        console.error('Search error:', error);
    }
}

function displayProducts(products) {
    const takeorderContainer = document.getElementById('takeorderContainer');
    takeorderContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = `
            <div class="product-card w-[15rem] h-[15rem] bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow duration-200">
                <img src="${product.image_url || './images/tako.png'}" alt="${product.product_name}" class="w-32 h-32 object-cover">
                <h3 class="text-center font-semibold">${product.product_name}</h3>
            </div>
        `;
        takeorderContainer.innerHTML += productCard;
    });

    // Reattach event listeners to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const modal = document.getElementById('modal');
            if (modal) {
                modal.classList.remove('hidden');
            }
        });
    });
}

async function searchOrders(searchTerm) {
    try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError) throw new Error(authError.message);

        const { data: userBranch, error: userError } = await supabase
            .from('users_table')
            .select('branch_id')
            .eq('id', userData.user.id)
            .single();
        if (userError) throw new Error(userError.message);

        let query = supabase
            .from('pos_orders_table')
            .select('*')
            .eq('branch_id', userBranch.branch_id);

        // Determine which table to update based on current tab
        const currentTab = document.querySelector('.text-red-600').textContent.trim();
        const status = currentTab === 'Complete Order' ? 'completed' : 'cancelled';
        query = query.eq('status', status);

        if (searchTerm) {
            query = query.or(`receipt_number.ilike.%${searchTerm}%,product_name.ilike.%${searchTerm}%`);
        }

        const { data: orders, error: ordersError } = await query;
        if (ordersError) throw new Error(ordersError.message);

        // Group orders by receipt number
        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.receipt_number]) {
                acc[order.receipt_number] = {
                    receipt_number: order.receipt_number,
                    products: {},
                    total_price: order.product_price,
                    payment_method: order.payment_method,
                    order_date: order.order_date,
                    status: order.status
                };
                acc[order.receipt_number].products[order.product_name] = 1;
            } else {
                acc[order.receipt_number].total_price += order.product_price;
                acc[order.receipt_number].products[order.product_name] = 
                    (acc[order.receipt_number].products[order.product_name] || 0) + 1;
            }
            return acc;
        }, {});

        // Update appropriate table based on status
        const tableBody = status === 'completed' ? 
            document.getElementById('completedTable') : 
            document.getElementById('cancelTable');

        if (!tableBody) return;

        if (Object.keys(groupedOrders).length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-4 text-center text-gray-500">
                        No ${status} orders found matching "${searchTerm}"
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = '';
        Object.values(groupedOrders).forEach((item) => {
            const formattedDate = new Date(item.order_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const productDisplay = Object.entries(item.products)
                .map(([name, count]) => `${name}${count > 1 ? ` (${count})` : ''}`)
                .join(', ');

            tableBody.innerHTML += `
                <tr class="border-b border-gray-300">
                    <td class="px-4 py-4">${item.receipt_number}</td>
                    <td class="px-4 py-4">${productDisplay}</td>
                    <td class="px-4 py-4">₱${item.total_price}</td>
                    <td class="px-4 py-4"><span class="bg-[#F9C1C2] py-1 px-6 rounded-md border border-red-600">${item.payment_method}</span></td>
                    <td class="px-4 py-4">${formattedDate}</td>
                    <td class="px-4 py-4">${item.status}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error('Search error:', error);
    }
} 