import { getTenants } from "@/app/actions/admin";
import { TenantManager } from "@/components/admin/tenant-manager";

export default async function TenantsPage() {
    const tenants = await getTenants();
    return <TenantManager tenants={tenants} />;
}
