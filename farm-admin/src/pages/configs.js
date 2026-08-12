export const cropsConfig = {
  entity: 'crops',
  title: 'Crops',
  columns: [
    { key: 'name', label: 'Crop' },
    { key: 'field', label: 'Field / Plot' },
    { key: 'status', label: 'Status' },
    {
      key: 'quantity',
      label: 'Qty',
      render: (item) => (item.quantity !== undefined && item.quantity !== '' ? `${item.quantity} ${item.unit || ''}` : '—'),
    },
    { key: 'plantingDate', label: 'Planted' },
    { key: 'harvestDate', label: 'Harvest' },
  ],
  formFields: [
    { key: 'name', label: 'Crop Name', type: 'text' },
    { key: 'field', label: 'Field / Plot', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['Vegetable', 'Fruit', 'Grain', 'Herb', 'Other'] },
    { key: 'status', label: 'Status', type: 'select', options: ['Planted', 'Growing', 'Ready to Harvest', 'Harvested'] },
    { key: 'plantingDate', label: 'Planting Date', type: 'date' },
    { key: 'harvestDate', label: 'Expected Harvest Date', type: 'date' },
    { key: 'quantity', label: 'Quantity', type: 'number' },
    { key: 'unit', label: 'Unit (kg, lbs, crates...)', type: 'text' },
    { key: 'reorderLevel', label: 'Low Stock Alert Below', type: 'number' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  defaultValues: { status: 'Planted' },
};

export const livestockConfig = {
  entity: 'livestock',
  title: 'Livestock',
  columns: [
    { key: 'species', label: 'Type' },
    { key: 'tagId', label: 'Tag / Group ID' },
    { key: 'count', label: 'Count' },
    { key: 'healthStatus', label: 'Health' },
    { key: 'acquiredDate', label: 'Acquired' },
  ],
  formFields: [
    { key: 'species', label: 'Type (e.g. Cattle, Goat, Chicken)', type: 'text' },
    { key: 'tagId', label: 'Tag / Group ID', type: 'text' },
    { key: 'count', label: 'Count', type: 'number' },
    { key: 'healthStatus', label: 'Health Status', type: 'select', options: ['Healthy', 'Sick', 'Under Treatment', 'Quarantined'] },
    { key: 'acquiredDate', label: 'Acquired Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  defaultValues: { healthStatus: 'Healthy' },
};

export const customersConfig = {
  entity: 'customers',
  title: 'Customers',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
  ],
  formFields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  defaultValues: {},
};

export const expensesConfig = {
  entity: 'expenses',
  title: 'Expenses',
  columns: [
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    {
      key: 'amount',
      label: 'Amount',
      render: (item) => (item.amount !== undefined && item.amount !== '' ? `$${Number(item.amount).toFixed(2)}` : '—'),
    },
    { key: 'paymentMethod', label: 'Payment' },
  ],
  formFields: [
    { key: 'date', label: 'Date', type: 'date' },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: ['Feed', 'Seeds & Plants', 'Equipment', 'Labor', 'Utilities', 'Fuel', 'Maintenance', 'Veterinary', 'Other'],
    },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'amount', label: 'Amount ($)', type: 'number' },
    { key: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['Cash', 'Bank Transfer', 'Card', 'Other'] },
  ],
  defaultValues: { date: new Date().toISOString().slice(0, 10) },
};

export const staffConfig = {
  entity: 'staff',
  title: 'Staff',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'payRate',
      label: 'Pay',
      render: (item) => (item.payRate !== undefined && item.payRate !== '' ? `$${item.payRate} / ${item.payType || ''}` : '—'),
    },
    { key: 'startDate', label: 'Start Date' },
  ],
  formFields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'payRate', label: 'Pay Rate', type: 'number' },
    { key: 'payType', label: 'Pay Type', type: 'select', options: ['Hourly', 'Daily', 'Monthly'] },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  defaultValues: {},
};

export const tasksConfig = {
  entity: 'tasks',
  title: 'Tasks',
  columns: [
    { key: 'title', label: 'Task' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'dueDate', label: 'Due' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
  ],
  formFields: [
    { key: 'title', label: 'Task Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'assignedTo', label: 'Assigned To', type: 'entitySelect', entity: 'staff', labelKey: 'name' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
    { key: 'status', label: 'Status', type: 'select', options: ['To Do', 'In Progress', 'Done'] },
  ],
  defaultValues: { status: 'To Do', priority: 'Medium' },
};
