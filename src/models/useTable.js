
export class UseTableModel{
  static async createUseTable(useTableData){
    const {table_id,employee_id, status} = useTableData
    try {
      await pool.query('INSERT INTO use_table (table_id, employee_id, status) VALUES (?,?,?)', [table_id, employee_id, status])
    } catch (error) {
      
    }
  }
}