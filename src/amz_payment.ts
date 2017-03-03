/*
 * Amazon Payment 共通 class
 * @author tatsunori nishikori
 * @version 0.1.0
 * @note 事前にOffAmazonPayments widget.jsをloadする必要があります
 */

class AmzPayment {

  // 出品者ID(seller ID)
  private sellerId: string;

  // クライアントID
  private clientId: string;

  // language
  private language: string = "ja_JP";

  // login Button Element Id
  private loginElmId: string = "AmazonPayButton";

  // Adress Widget Element Id
  private addressElmId: string = "addressBookWidgetDiv";

  // Wallet Widget Element Id
  private walletElmId: string = "walletWidgetDiv";

  // 定期支払同意 check Widget Element Id
  private consentElmId: string = "consentWidgetDiv";

  // Form element id
  private formElm: string;

  // element BillingAgreementId
  private billingAgreementElmId: string = "billing_agreement_id";

  // element OrderReferenceId
  private orderReferenceElmId: string = "order_reference_id";

  // element BillingAgreementId
  private consentStatusElmId: string = "amz_consent_status";

  // address Widget agreementType
  private agreementType: string;

  // widget callbacks
  private widgetCallbacks: Object = {
    addressReadyCallback: null,     // addressWidget onReady callback
    addressSelectCallback: null,    // addressWidget onAddressSelect callback
    addressBACreateCallback: null,  // addressWidget onBillingAgreementCreate callback
    addressORCreateCallback: null,  // addressWidget onOrderReferenceCreate callback
    walletReadyCallback: null,      // walletWidget onReady callback
    walletSelectCallback: null,     // walletWidget onPaymentSelect callback
    consentReadyCallback: null,     // consentWidget onReady callback
    consentSelectCallback: null     // consentWidget onConsent callback
  };

  // BillingAgreementId
  public billingAgreementId: string

  // OrderReferenceId
  public orderReferenceId: string

  // Login Button Widget Object
  public loginButton: string

  // Address Widgets Object
  public addressObj: string

  // Wallet Widget Object
  public walletObj: string

  // consent Widget Object
  public consentObj: string

  // 支払い同意のステータス
  public consentStatus: string

  // amazon Token
  public amazonToken: string

  // amazon authRequest
  public authRequest: string

  /*
   * constructor
   * @param {String} sellerId セラーID(出品者ID)
   * @param {String} clientId client id
   * @param {String} formElmId BillingAgreement / OrderReferenceIdをhidden fieldにセットしたいform要素
   * @param {Object} opts
   * @param {String} type periodic: 定期支払
   *   * opts.addressReadyCallback {Function} address Widget onReady callback
   *   * opts.addressSelectCallback {Function} address Widget onAddressSelect callback
   *   * opts.addressBACreateCallback {Function} address Widget onBillingAgreementCreate callback
   *   * opts.addressORCreateCallback {Function} address Widget onOrderReferenceCreate callback
   *   * opts.walletReadyCallback {Function} wallet Widget onReady callback
   *   * opts.walletSelectCallback {Function} address Widget onPaymentSelect callback
   *   * opts.consentReadyCallback {Function} consent Widget onReady callback
   *   * opts.consentSelectCallback {Function} consent Widget onConsent callback
   */
  constructor: (sellerId: string, clientId: string, formElmId: string = "form", widgetType: string = "periodic", opts: Map<K,V> = {}) ->
    _sellerId = sellerId
    _clientId = clientId
    _formElm = $(formElmId)
    configOptsParse.call @, opts

    window.amazon.Login.setClientId(_clientId)
    window.amazon.Login.setLanguage(_language)

    if type is "periodic"
      _agreementType = "BillingAgreement"
    else
      _agreementType = null
}
