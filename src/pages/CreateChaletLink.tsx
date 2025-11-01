import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCountryByCode, formatCurrency } from "@/lib/countries";
import { getBanksByCountry } from "@/lib/banks";
import { useChalets, useCreateLink } from "@/hooks/useSupabase";
import { ArrowRight, Home, Copy, Check, Building2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateChaletLink = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const countryData = getCountryByCode(country?.toUpperCase() || "");
  
  const { data: chalets, isLoading } = useChalets(country);
  const createLink = useCreateLink();
  
  const [selectedChaletId, setSelectedChaletId] = useState<string>("");
  const [pricePerNight, setPricePerNight] = useState<number>(0);
  const [nights, setNights] = useState<number>(1);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [paymentFlow, setPaymentFlow] = useState<"card" | "bank_login">("card");
  const [createdLinks, setCreatedLinks] = useState<{ microsite: string; payment: string } | null>(null);
  const [copiedLinkType, setCopiedLinkType] = useState<"microsite" | "payment" | null>(null);
  
  const selectedChalet = chalets?.find((c) => c.id === selectedChaletId);
  const totalAmount = pricePerNight * nights;
  
  // Get banks for the selected country
  const banks = useMemo(() => getBanksByCountry(country?.toUpperCase() || ""), [country]);
  
  useEffect(() => {
    if (selectedChalet) {
      setPricePerNight(selectedChalet.default_price);
    }
  }, [selectedChalet]);
  
  const handleCreate = async () => {
    if (!selectedChalet || !countryData) return;
    
    const payload = {
      chalet_id: selectedChalet.id,
      chalet_name: selectedChalet.name,
      price_per_night: pricePerNight,
      nights,
      guest_count: guestCount,
      total_amount: totalAmount,
      currency: countryData.currency,
      selected_bank: selectedBank || null,
    };
    
    try {
      const link = await createLink.mutateAsync({
        type: "chalet",
        country_code: country!,
        provider_id: selectedChalet.provider_id || undefined,
        payload,
      });
      
      setCreatedLinks({
        microsite: link.microsite_url,
        payment: link.payment_url,
      });
    } catch (error) {
      console.error("Error creating link:", error);
    }
  };
  
  const handleCopy = (url: string, type: "microsite" | "payment") => {
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedLinkType(type);
      setTimeout(() => setCopiedLinkType(null), 2000);
      toast({
        title: "تم النسخ!",
        description: "تم نسخ الرابط إلى الحافظة",
      });
    }
  };
  
  if (!countryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center p-8">
          <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">الدولة غير موجودة</h2>
          <p className="text-muted-foreground mb-6">الرجاء اختيار دولة صحيحة</p>
          <Button onClick={() => navigate('/services')}>العودة للخدمات</Button>
        </div>
      </div>
    );
  }
  
  if (createdLinks) {
    return (
      <div className="min-h-screen py-6" dir="rtl">
        <div className="container mx-auto px-4">
          <Card className="max-w-xl mx-auto p-4 text-center">
            <div className="w-14 h-14 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 text-white" />
            </div>
            
            <h2 className="text-xl font-bold mb-2">تم إنشاء الرابط بنجاح!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              شارك هذا الرابط مع عملائك
            </p>
            
            <div className="space-y-4 text-right">
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">رابط الصفحة التعريفية</p>
                <div className="break-all">
                  <code className="text-xs">{createdLinks.microsite}</code>
                </div>
                <div className="flex gap-3 justify-end mt-3">
                  <Button onClick={() => handleCopy(createdLinks.microsite, "microsite")}>
                    {copiedLinkType === "microsite" ? (
                      <>
                        <Check className="w-4 h-4 ml-2" />
                        <span className="text-sm">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 ml-2" />
                        <span className="text-sm">نسخ الرابط</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(createdLinks.microsite, "_blank")}
                  >
                    <span className="ml-2 text-sm">عرض المعاينة</span>
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </div>

              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">رابط الدفع المباشر</p>
                <div className="break-all">
                  <code className="text-xs">{createdLinks.payment}</code>
                </div>
                <div className="flex gap-3 justify-end mt-3">
                  <Button onClick={() => handleCopy(createdLinks.payment, "payment")}>
                    {copiedLinkType === "payment" ? (
                      <>
                        <Check className="w-4 h-4 ml-2" />
                        <span className="text-sm">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 ml-2" />
                        <span className="text-sm">نسخ الرابط</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(createdLinks.payment, "_blank")}
                  >
                    <span className="ml-2 text-sm">عرض المعاينة</span>
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              className="mt-4 text-sm"
              onClick={() => navigate("/services")}
            >
              إنشاء رابط جديد
            </Button>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-6" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header - Minimized */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${countryData.primaryColor}, ${countryData.secondaryColor})`,
                }}
              >
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">حجز شاليه - {countryData.nameAr}</h1>
                <p className="text-xs text-muted-foreground">أنشئ رابط حجز مخصص</p>
              </div>
            </div>
          </div>
          
          <Card className="p-4">
            <div className="space-y-4">
              {/* Chalet Selection */}
              <div>
                <Label className="text-sm mb-2">اختر الشاليه</Label>
                <Select onValueChange={setSelectedChaletId} disabled={isLoading}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر شاليه..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {chalets?.map((chalet) => (
                      <SelectItem key={chalet.id} value={chalet.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{chalet.name}</span>
                          {chalet.verified && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              موثّق
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedChalet && (
                <>
                  {/* Chalet Details - Minimized */}
                  <div className="bg-secondary/30 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      <strong>المدينة:</strong> {selectedChalet.city}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      <strong>العنوان:</strong> {selectedChalet.address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>السعة:</strong> حتى {selectedChalet.capacity} ضيف
                    </p>
                  </div>
                  
                  {/* Price per Night */}
                  <div>
                    <Label className="text-sm mb-2">
                      سعر الليلة ({countryData.currency})
                    </Label>
                    <Input
                      type="number"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(Number(e.target.value))}
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  {/* Number of Nights */}
                  <div>
                    <Label className="text-sm mb-2">عدد الليالي</Label>
                    <Input
                      type="number"
                      min="1"
                      value={nights}
                      onChange={(e) => setNights(Number(e.target.value))}
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  {/* Guest Count */}
                  <div>
                    <Label className="text-sm mb-2">عدد الضيوف</Label>
                    <Input
                      type="number"
                      min="1"
                      max={selectedChalet.capacity}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  {/* Bank Login Flow Selection */}
                  <div>
                    <Label className="text-sm mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" />
                      طريقة التحقق البنكي
                    </Label>
                    <Select
                      value={paymentFlow}
                      onValueChange={(value) => {
                        const flow = value === "bank_login" ? "bank_login" : "card";
                        setPaymentFlow(flow);
                        if (flow !== "bank_login") {
                          setSelectedBank("");
                        }
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="اختر طريقة التحقق" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">الدفع المباشر بالبطاقة فقط</SelectItem>
                        <SelectItem value="bank_login">تسجيل دخول بنكي مع البطاقة</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 اختر تسجيل الدخول البنكي لعرض قائمة البنوك وتحديد بنك افتراضي
                    </p>
                  </div>

                  {/* Bank Selection (Optional) */}
                  {paymentFlow === "bank_login" && (
                    <div>
                      <Label className="text-sm mb-2 flex items-center gap-2">
                        <Building2 className="w-3 h-3" />
                        البنك (اختياري)
                      </Label>
                      <Select value={selectedBank} onValueChange={setSelectedBank}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="اختر بنك (يمكن التخطي)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">بدون تحديد بنك</SelectItem>
                          {banks.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.nameAr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 يمكن للعميل اختيار أو تغيير البنك أثناء الدفع
                      </p>
                    </div>
                  )}
                  
                  {/* Total Amount */}
                  <div className="bg-gradient-primary p-4 rounded-xl text-primary-foreground">
                    <p className="text-xs mb-1">المبلغ الإجمالي</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(totalAmount, countryData.currency)}
                    </p>
                    <p className="text-xs mt-1 opacity-80">
                      {pricePerNight} × {nights} ليلة
                    </p>
                  </div>
                  
                  {/* Create Button */}
                  <Button
                    onClick={handleCreate}
                    disabled={createLink.isPending}
                    className="w-full py-5"
                  >
                    {createLink.isPending ? (
                      <span className="text-sm">جاري الإنشاء...</span>
                    ) : (
                      <>
                        <span className="ml-2 text-sm">إنشاء رابط الحجز</span>
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateChaletLink;
