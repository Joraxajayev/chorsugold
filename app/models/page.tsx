"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar" // Removed SidebarInset import
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Printer } from "lucide-react"
import { TopNav } from "@/components/top-nav"
// Add useI18n hook and translate all models page content
import { useI18n } from "@/lib/i18n"

const jewelryModels = [
  {
    id: 1,
    name: "BULG",
    modelBase: "I",
    weight: 83.56,
    masterWeight: 92.13,
  },
  {
    id: 2,
    name: "MAD",
    modelBase: "I",
    weight: 108.05,
    masterWeight: 117.76,
  },
  {
    id: 3,
    name: "DOR",
    modelBase: "I",
    weight: 197.31,
    masterWeight: 217.55,
  },
  {
    id: 4,
    name: "CARTER",
    modelBase: "I",
    weight: 27.79,
    masterWeight: 30.64,
  },
]

export default function JewelryModelsPage() {
  const { t } = useI18n()
  const [searchCode, setSearchCode] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newModel, setNewModel] = useState({
    name: "",
    weight: "",
    price: "",
    base: "",
  })

  // Calculate totals
  const totalWeight = jewelryModels.reduce((sum, model) => sum + model.weight, 0)
  const totalMasterWeight = jewelryModels.reduce((sum, model) => sum + model.masterWeight, 0)

  const handleAddModel = () => {
    // Here you would typically save to database
    console.log("Adding new model:", newModel)
    setIsAddDialogOpen(false)
    setNewModel({ name: "", weight: "", price: "", base: "" })
  }

  const handleDeleteModel = (id: number) => {
    // Here you would typically delete from database
    console.log("Deleting model:", id)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {" "}
        {/* Replaced SidebarInset with this div */}
        <TopNav pageTitle={t("models.title")} />
        <main className="flex-1 flex flex-col gap-6 px-4 py-6">
          {" "}
          {/* Changed p-6 to px-4 py-6 and wrapped in main */}
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">{t("models.subtitle")}</h2>

            {/* Weight Summary */}
            <div className="space-y-2">
              <div className="text-lg">
                <span className="font-medium">{t("models.allWeight")}: </span>
                <span className="font-bold">{totalWeight.toFixed(2)}</span>
              </div>
              <div className="text-lg">
                <span className="font-medium">{t("models.allPlus")}: </span>
                <span className="font-bold">{totalMasterWeight.toFixed(2)}</span>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
              <div className="relative flex-1">
                <Input
                  placeholder={t("models.codePlaceholder")}
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="text-center"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">{t("models.addModel")}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Yangi model qo'shish</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-right">
                        <span className="text-red-500">*</span> Nomi:
                      </Label>
                      <Input
                        id="name"
                        placeholder="Model nomini tanlang"
                        value={newModel.name}
                        onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                        className="border-red-200"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="weight" className="text-right">
                        <span className="text-red-500">*</span> Vesi:
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={newModel.weight}
                        onChange={(e) => setNewModel({ ...newModel, weight: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="price" className="text-right">
                        Narxi:
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={newModel.price}
                        onChange={(e) => setNewModel({ ...newModel, price: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="base" className="text-right">
                        <span className="text-red-500">*</span> Baza:
                      </Label>
                      <Input
                        id="base"
                        value={newModel.base}
                        onChange={(e) => setNewModel({ ...newModel, base: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={handleAddModel} className="w-full bg-blue-600 hover:bg-blue-700">
                      Qo'shish
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="bg-gray-200">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>

            {/* Weight Display Circle */}
            <div className="flex justify-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center">
                <div className="text-xs">I</div>
                <div className="text-lg font-bold">{totalWeight.toFixed(2)}</div>
                <div className="text-xs">{totalMasterWeight.toFixed(2)}</div>
              </div>
            </div>
          </div>
          {/* Models Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-center font-bold">T/R</TableHead>
                    <TableHead className="text-center font-bold">Model Nomi</TableHead>
                    <TableHead className="text-center font-bold">Model Bazasi</TableHead>
                    <TableHead className="text-center font-bold">Vesi</TableHead>
                    <TableHead className="text-center font-bold">Ustidigi molda</TableHead>
                    <TableHead className="text-center font-bold">O'chirish</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jewelryModels.map((model, index) => (
                    <TableRow key={model.id} className="hover:bg-gray-50">
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="text-center font-medium">{model.name}</TableCell>
                      <TableCell className="text-center">{model.modelBase}</TableCell>
                      <TableCell className="text-center">{model.weight.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{model.masterWeight.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteModel(model.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  )
}
