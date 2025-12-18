import { getExpenseCategories } from "@/app/actions/config";
import { PageHeader } from "@/components/ui/page-header";
import { ExpenseCategoriesList } from "@/components/settings/expense-categories-list";
import { ExpenseCategoryForm } from "@/components/settings/expense-category-form";
import { Receipt } from "lucide-react";

export default async function ExpenseCategoriesPage() {
    const categories = await getExpenseCategories();

    return (
        <div>
            <PageHeader
                icon="Receipt"
                iconColor="text-amber-600"
                iconBg="bg-amber-100"
                title="Expense Categories"
                description="Configure expense types and limits."
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <ExpenseCategoriesList categories={categories} />
                <div className="lg:sticky lg:top-4 h-fit">
                    <div className="border rounded-lg p-5 bg-card">
                        <h3 className="font-semibold mb-3">Add Category</h3>
                        <ExpenseCategoryForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
