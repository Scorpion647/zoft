'use client'

import {createClient} from '../supabase/client'
import {CustomDataError, DBTables, manageErrorMessage} from "@/app/_lib/definitions";
import {Except} from "type-fest";
import {deleteUserServer} from './server_service';

type ProfileTable = DBTables['profile']
export type ProfileRow = ProfileTable['Row']

type MaterialTable = DBTables['material']
export type MaterialRow = MaterialTable['Row']

type RecordTable = DBTables['record']
export type RecordRow = RecordTable['Row']

type RecordInfoTable = DBTables['record_info']
export type RecordInfoRow = RecordInfoTable['Row']

type SupplierTable = DBTables['supplier']
export type SupplierRow = SupplierTable['Row']

type SupplierEmployeeTable = DBTables['supplier_employee']
export type SupplierEmployeeRow = SupplierEmployeeTable['Row']

export async function getMaterial(code: MaterialRow['code']): Promise<MaterialRow | CustomDataError | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('material').select('*').eq('code', code).single();

    if (error) {
        return manageErrorMessage(error);
    }
    return data;
}

export async function getMaterials(
    page: number = 1,
    limit: number = 10,
    search?: string,
    order_by?: [keyof MaterialRow, { ascending?: boolean, foreignTable?: boolean, nullsFirst?: boolean }][]
): Promise<MaterialRow[] | CustomDataError | null> {
    const supabase = createClient();
    const query = supabase.from('material').select('*')

    if (search && search.trim() !== "") {
        query.textSearch('name_description', search, {
            type: 'websearch'
        });
    }

    if (order_by && order_by.length > 0) {
        order_by.forEach(([column, options]) => {
            query.order(column, options);
        })
    }

    const {data, error} = await query.range(((page - 1) * limit), (page * limit) - 1);

    if (error) {
        return manageErrorMessage(error);
    }
    return data;
}

export async function insertMaterial(material: MaterialTable['Insert']): Promise<MaterialRow['code'] | CustomDataError | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('material').insert(material).select('code').single();

    if (error || !data.code) {
        return manageErrorMessage(error);
    }
    return data.code;
}

export async function updateMaterial(code: MaterialRow['code'], new_data: MaterialTable['Update']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('material').update(new_data).eq('code', code).single();
    if (error) {
        return manageErrorMessage(error);
    }
}

export async function deleteMaterial(code: MaterialRow['code']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('material').delete().eq('code', code);

    if (error) {
        return manageErrorMessage(error);
    }
}


export async function getRecord(purchase_order: string, 
    item: number
): Promise<RecordRow | CustomDataError | null> {
    const supabase = createClient();
    
    const {data, error} = await supabase
        .from('record')
        .select('*')
        .eq('purchase_order', purchase_order)
        .eq('item', item)
        .single();  // .single() garantiza que se espera solo un resultado

    if (error) {
        return manageErrorMessage(error);
    }

    return data;
}

export async function getRecords(
    page: number = 1,
    limit: number = 10,
    search?: string,
    order_by?: [keyof RecordRow, { ascending?: boolean, foreignTable?: boolean, nullsFirst?: boolean }][]
): Promise<RecordRow[] | CustomDataError | null> {
    const supabase = createClient();
    const query = supabase.from('record').select('*');

    if (search && search.trim() !== "") {
        query.textSearch('purchase_order', search, {
            type: 'websearch'
        });
    }

    if (order_by && order_by.length > 0) {
        order_by.forEach(([column, options]) => {
            query.order(column, options);
        })
    }

    const {data, error} = await query.range(((page - 1) * limit), (page * limit) - 1);

    if (error) {
        return manageErrorMessage(error);
    }

    return data;
}

export async function insertRecord(record: RecordTable['Insert']): Promise<RecordRow['id'] | CustomDataError | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('record').insert(record).select('id').single();

    if (error || !data.id) {
        return manageErrorMessage(error);
    }
    return data.id;
}

export async function updateRecord(
    purchase_order: string, 
    item: string, 
    new_data: RecordTable['Update']
): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase
        .from('record')
        .update(new_data)
        .eq('purchase_order', purchase_order)
        .eq('item', item)
        .single();  // .single() garantiza que se espera solo un resultado

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function deleteRecord(id: RecordRow['id']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('record').delete().eq('id', id);

    if (error) {
        return manageErrorMessage(error);
    }
}


export async function getRecordInfo(id: RecordInfoRow['id']): Promise<RecordInfoRow | CustomDataError | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('record_info').select('*').eq('id', id).single();

    if (error || !data) {
        return manageErrorMessage(error);
    }
    return data;
}

export async function getRecordsInfo(
    page: number = 1,
    limit: number = 10,
    search?: string,
    order_by?: [keyof RecordInfoRow, { ascending?: boolean, foreignTable?: boolean, nullsFirst?: boolean }][]
): Promise<RecordInfoRow[] | CustomDataError | null> {
    const supabase = createClient();
    const query = supabase.from('record_info').select('*');

    if (search && search.trim() !== "") {
        query.textSearch('name_domain', search, {
            type: 'websearch'
        });
    }

    if (order_by && order_by.length > 0) {
        order_by.forEach(([column, options]) => {
            query.order(column, options);
        })
    }

    const {data, error} = await query.range(((page - 1) * limit), (page * limit) - 1);

    if (error) {
        return manageErrorMessage(error);
    }
    return data;
}

export async function insertRecordInfo(info: RecordInfoTable['Insert']): Promise<RecordInfoRow['id'] | CustomDataError | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('record_info').insert(info).select('id').single();

    if (error || !data.id) {
        return manageErrorMessage(error);
    }

    return data.id;
}

export async function updateRecordInfo(id: RecordInfoRow['id'], new_data: RecordInfoTable['Update']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('record_info').update(new_data).eq('id', id);

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function deleteRecordInfo(id: RecordInfoRow['record_id']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('record_info').delete().eq('record_id', id);

    if (error) {
        return manageErrorMessage(error);
    }
}


export async function getSupplier(id?: SupplierRow['id'], domain?: SupplierRow['domain'], name?: SupplierRow['name']): Promise<SupplierRow | CustomDataError | null> {
    const supabase = createClient();

    const query = supabase.from('supplier').select('*');
    if (id) {
        query.eq('id', id);
    }

    if (domain) {
        query.eq('domain', domain);
    }

    if (name) {
        query.eq('name', name);
    }

    const {data, error} = await query.single();

    if (error) {
        return manageErrorMessage(error);
    }
    return data;
}

export async function getSuppliers(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    order_by?: [keyof SupplierRow, { ascending?: boolean, foreignTable?: boolean, nullsFirst?: boolean }][]
): Promise<SupplierRow[] | CustomDataError | null> {
    const supabase = createClient();
    const query = supabase.from('supplier').select('*');

    if (search && search.trim() !== "") {
        query.textSearch('name_domain', search, {
            type: 'websearch'
        });
    }

    if (order_by && order_by.length > 0) {
        order_by.forEach(([column, options]) => {
            query.order(column, options);
        })
    }

    const {data, error} = await query.range(((page - 1) * limit), (page * limit) - 1);

    if (error) {
        return manageErrorMessage(error);
    }
    return data;
}

export async function insertSupplier(args: SupplierTable['Insert']): Promise<CustomDataError | SupplierRow['id'] | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('supplier').insert(args).select('id').single();

    if (error) {
        return manageErrorMessage(error);
    }

    return data.id;
}

export async function updateSupplier(id: SupplierRow['name'], new_data: SupplierTable['Update']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('supplier').update(new_data);

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function deleteSupplier(args: SupplierRow['id']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('supplier').delete().eq('id', args);

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function getEmployees(
    supplier_id?: SupplierRow['id'],
    page: number = 1,
    limit: number = 10,
    search?: string,
    order_by?: [keyof DBTables['profile']['Row'], {
        ascending?: boolean,
        foreignTable?: boolean,
        nullsFirst?: boolean
    }][]
) {
    const supabase = createClient();

    const query = supabase.from('supplier_employee').select('profile(*)')

    if (supplier_id) {
        query.eq('supplier_id', supplier_id).single();
    }

    if (search && search.trim() !== "") {
        query.textSearch('name', search, {
            type: 'websearch'
        });
    }

    if (order_by && order_by.length > 0) {
        order_by.forEach(([column, options]) => {
            query.order(column, options);
        })
    }


    const {data, error} = await query.range(((page - 1) * limit), (page * limit) - 1);

    if (error) {
        return manageErrorMessage(error);
    }

    return data;

}

export async function insertEmployee(relation: SupplierEmployeeTable['Insert']): Promise<CustomDataError | SupplierEmployeeRow | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('supplier_employee').insert(relation).select('*').single();

    if (error) {
        return manageErrorMessage(error);
    }

    return data;
}

export async function deleteEmployee(employee_id: SupplierEmployeeRow['user_id']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('supplier_employee').delete().eq('user_id', employee_id);

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function updateEmployee(new_data: SupplierEmployeeTable['Update']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('supplier_employee').update(new_data);

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function getProfile(user_id: ProfileRow['user_id']): Promise<ProfileRow | CustomDataError | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('profile').select('*').eq('user_id', user_id).single();

    if (error) {
        return manageErrorMessage(error);
    }
    return data;
}

export async function updateProfile(profile_id: ProfileRow['user_id'], data: Except<ProfileRow, 'created_at' | 'user_id'>): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {email, full_name, role} = data;

    const {error} = await supabase.from('profile').update({email, full_name, role}).eq('user_id', profile_id).single();

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function deleteUser(user_id: ProfileRow['user_id']): Promise<CustomDataError | void> {
    try {
        await deleteUserServer(user_id);
    } catch (error) {
        return manageErrorMessage(null);
    }
}