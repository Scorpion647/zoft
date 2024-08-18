'use client'

import {createClient} from '../supabase/client'
import {CustomDataError, manageErrorMessage} from "@/app/_lib/definitions";
import {Except} from "type-fest";
import {deleteUserServer} from './server_service';
import {Tables, TablesInsert, TablesUpdate} from "@/app/_lib/supabase/db";


export async function getMaterial(code: Tables<'material'>['code']): Promise<Tables<'material'> | CustomDataError | null> {
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
    order_by?: [keyof Tables<'material'>, { ascending?: boolean, foreignTable?: boolean, nullsFirst?: boolean }][]
): Promise<Tables<'material'>[] | CustomDataError | null> {
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

export async function insertMaterial(material: TablesInsert<'material'>): Promise<Tables<'material'>['code'] | CustomDataError | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('material').insert(material).select('code').single();

    if (error || !data.code) {
        return manageErrorMessage(error);
    }
    return data.code;
}

export async function updateMaterial(code: Tables<'material'>['code'], new_data: TablesUpdate<'material'>): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('material').update(new_data).eq('code', code).single();
    if (error) {
        return manageErrorMessage(error);
    }
}

export async function deleteMaterial(code: Tables<'material'>['code']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('material').delete().eq('code', code);

    if (error) {
        return manageErrorMessage(error);
    }
}


export async function getRecord(purchase_order: string, 
    item: number
): Promise<Tables<'record'> | CustomDataError | null> {
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
    order_by?: [keyof Tables<'record'>, { ascending?: boolean, foreignTable?: boolean, nullsFirst?: boolean }][]
): Promise<Tables<'record'>[] | CustomDataError | null> {
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

export async function insertRecord(record: TablesInsert<'record'>): Promise<Tables<'record'>['id'] | CustomDataError | null> {
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
    new_data: TablesUpdate<'record'>
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

export async function deleteRecord(id: Tables<'record'>['id']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('record').delete().eq('id', id);

    if (error) {
        return manageErrorMessage(error);
    }
}


export async function getRecordInfo(id: Tables<'record_info'>['id']): Promise<Tables<'record_info'> | CustomDataError | null> {
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
    order_by?: [keyof Tables<'record_info'>, { ascending?: boolean, foreignTable?: boolean, nullsFirst?: boolean }][]
): Promise<Tables<'record_info'>[] | CustomDataError | null> {
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

export async function insertRecordInfo(info: TablesInsert<'record_info'>): Promise<Tables<'record_info'>['id'] | CustomDataError | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('record_info').insert(info).select('id').single();

    if (error || !data.id) {
        return manageErrorMessage(error);
    }

    return data.id;
}

export async function updateRecordInfo(id: Tables<'record_info'>['id'], new_data: TablesUpdate<'record_info'>): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('record_info').update(new_data).eq('id', id);

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function deleteRecordInfo(id: Tables<'record_info'>['record_id']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('record_info').delete().eq('record_id', id);

    if (error) {
        return manageErrorMessage(error);
    }
}


export async function getSupplier(id?: Tables<'supplier'>['id'], domain?: Tables<'supplier'>['domain'], name?: Tables<'supplier'>['name']): Promise<Tables<'supplier'> | CustomDataError | null> {
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
    order_by?: [keyof Tables<'supplier'>, { ascending?: boolean, foreignTable?: boolean, nullsFirst?: boolean }][]
): Promise<Tables<'supplier'>[] | CustomDataError | null> {
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

export async function insertSupplier(args: TablesInsert<'supplier'>): Promise<CustomDataError | Tables<'supplier'>['id'] | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('supplier').insert(args).select('id').single();

    if (error) {
        return manageErrorMessage(error);
    }

    return data.id;
}

export async function updateSupplier(id: Tables<'supplier'>['name'], new_data: TablesUpdate<'supplier'>): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('supplier').update(new_data).eq('id', id);

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function deleteSupplier(args: Tables<'supplier'>['id']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('supplier').delete().eq('id', args);

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function getEmployees(
    supplier_id?: Tables<'supplier_employee'>['supplier_id'],
    page: number = 1,
    limit: number = 10,
    search?: string,
    order_by?: [keyof Tables<'profile'>, {
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

export async function insertEmployee(relation: TablesInsert<'supplier_employee'>): Promise<CustomDataError | Tables<'supplier_employee'> | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('supplier_employee').insert(relation).select('*').single();

    if (error) {
        return manageErrorMessage(error);
    }

    return data;
}

export async function deleteEmployee(employee_id: Tables<'supplier_employee'>['user_id']): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('supplier_employee').delete().eq('user_id', employee_id);

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function updateEmployee(new_data: TablesUpdate<'supplier_employee'>): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {error} = await supabase.from('supplier_employee').update(new_data);

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function getProfile(user_id: Tables<'profile'>['user_id']): Promise<Tables<'profile'> | CustomDataError | null> {
    const supabase = createClient();
    const {data, error} = await supabase.from('profile').select('*').eq('user_id', user_id).single();

    if (error) {
        return manageErrorMessage(error);
    }
    return data;
}

export async function updateProfile(profile_id: Tables<'profile'>['user_id'], data: Except<Tables<'profile'>, 'created_at' | 'user_id'>): Promise<CustomDataError | void> {
    const supabase = createClient();
    const {email, full_name, role} = data;

    const {error} = await supabase.from('profile').update({email, full_name, role}).eq('user_id', profile_id).single();

    if (error) {
        return manageErrorMessage(error);
    }
}

export async function deleteUser(user_id: Tables<'profile'>['user_id']): Promise<CustomDataError | void> {
    try {
        await deleteUserServer(user_id);
    } catch (error) {
        return manageErrorMessage(null);
    }
}