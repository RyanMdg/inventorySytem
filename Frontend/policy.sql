-- Allow Users to Read Only Their Own Branch's Products
CREATE POLICY "User can view their own branch products"
ON products_table
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users_table 
    WHERE users_table.id = auth.uid() 
    AND users_table.branch_id = products_table.branch_id
  )
);

-- Allow Users to Insert Products Only for Their Own Branch
CREATE POLICY "User can add products to their own branch"
ON products_table
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_table 
    WHERE users_table.id = auth.uid() 
    AND users_table.branch_id = products_table.branch_id
  )
);

-- Prevent Users from Updating Products from Other Branches
CREATE POLICY "User can update their own branch products"
ON products_table
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users_table 
    WHERE users_table.id = auth.uid() 
    AND users_table.branch_id = products_table.branch_id
  )
);

-- Prevent Users from Deleting Products from Other Branches
CREATE POLICY "User can delete their own branch products"
ON products_table
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users_table 
    WHERE users_table.id = auth.uid() 
    AND users_table.branch_id = products_table.branch_id
  )
);
