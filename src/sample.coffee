##
# Amazon Payment 共通 class
# @author tatsunori nishikori
# @version 0.1.0
# @note 事前にOffAmazonPayments widget.jsをloadする必要があります
class AmazonPayment

  # 出品者ID(seller ID)
  _sellerId = null

  # クライアントID
  _clientId = null

  # language
  _language = "ja_JP"

  # login Button Element Id
  _loginElmId = "AmazonPayButton"

  # Adress Widget Element Id
  _addressElmId = "addressBookWidgetDiv"

  # Wallet Widget Element Id
  _walletElmId = "walletWidgetDiv"

  # 定期支払同意 check Widget Element Id
  _consentElmId = "consentWidgetDiv"

  # Form element id
  _formElm = null

  # element BillingAgreementId
  _billingAgreementElmId = "billing_agreement_id"

  # element OrderReferenceId
  _orderReferenceElmId = "order_reference_id"

  # element BillingAgreementId
  _consentStatusElmId = "amz_consent_status"

  # address Widget agreementType
  _agreementType = null


  # BillingAgreementId
  @billingAgreementId = null

  # OrderReferenceId
  @orderReferenceId = null

  # Login Button Widget Object
  @loginButton = null

  # Address Widgets Object
  @addressObj = null

  # Wallet Widget Object
  @walletObj = null

  # consent Widget Object
  @consentObj = null

  # 支払い同意のステータス
  @consentStatus = null

  # amazon Token
  @amazonToken = null

  # amazon authRequest
  @authRequest = null

  _widgetCallbacks = {
    addressReadyCallback: null,     # addressWidget onReady callback
    addressSelectCallback: null,    # addressWidget onAddressSelect callback
    addressBACreateCallback: null,  # addressWidget onBillingAgreementCreate callback
    addressORCreateCallback: null,  # addressWidget onOrderReferenceCreate callback
    walletReadyCallback: null,      # walletWidget onReady callback
    walletSelectCallback: null,     # walletWidget onPaymentSelect callback
    consentReadyCallback: null,     # consentWidget onReady callback
    consentSelectCallback: null     # consentWidget onConsent callback
  }

  ##
  # constructor
  # @param {String} sellerId セラーID(出品者ID)
  # @param {String} clientId client id
  # @param {String} formElmId BillingAgreement / OrderReferenceIdをhidden fieldにセットしたいform要素
  # @param {Object} opts
  # @param {String} type periodic: 定期支払
  #   * opts.addressReadyCallback {Function} address Widget onReady callback
  #   * opts.addressSelectCallback {Function} address Widget onAddressSelect callback
  #   * opts.addressBACreateCallback {Function} address Widget onBillingAgreementCreate callback
  #   * opts.addressORCreateCallback {Function} address Widget onOrderReferenceCreate callback
  #   * opts.walletReadyCallback {Function} wallet Widget onReady callback
  #   * opts.walletSelectCallback {Function} address Widget onPaymentSelect callback
  #   * opts.consentReadyCallback {Function} consent Widget onReady callback
  #   * opts.consentSelectCallback {Function} consent Widget onConsent callback
  constructor: (sellerId, clientId, formElmId = "form", type = "periodic", opts = {}) ->
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

  ##
  # set agreementType
  # @param {String} type periodic: 定期支払, normal: 通常商品のみ
  setAgreement: (type = "periodic") ->
    if type is "periodic"
      _agreementType = "BillingAgreement"
    else
      _agreementType = null

  ##
  # login widget
  # @param {String} elementId Button設置したいHTML id
  # @param {String} scope 表示させたいwidgetのscope
  # @param {Object} authCallback 認証後コールバック関数/リダイレクトURL
  # @param {String} type Button type LwA : ログイン, PwA: 支払い
  # @param {String} color Button color
  # @param {String} size Button size
  # @param {Object} signInCallback 注文情報へアクセスするコールバック関数
  # @param {Boolean} popup true: popup, false: no popup
  loginWidget: (scope, authCallback, type = "LwA", color = "LightGray", size = "medium",
                signInCallback = null, popup = true) ->
    _self = @
    _setBillingAgreementId = setBillingAgreementId
    _setOrderReferenceId = setOrderReferenceId
    _authRequest = @authRequest

    opts = {
      type:  type,
      color: color,
      size:  size,
      authorization: ->
        loginOptions = {
          scope: scope,
          popup: popup
        }
        _authRequest = amazon.Login.authorize(loginOptions, authCallback)

      onSignIn: (obj) ->
        console.log("OffAmazonPayments.Button.onSignIn", obj)
        if _agreementType is "BillingAgreement" and typeof obj.getAmazonBillingAgreementId isnt "undefined"
          _setBillingAgreementId.call(_self, obj)
        else
          _setOrderReferenceId.call(_self, obj)

        if signInCallback?
          signInCallback.call(_self, obj)
    }

    if _agreementType is "BillingAgreement"
      opts.agreementType = _agreementType

    @loginButton = OffAmazonPayments.Button(_loginElmId, _sellerId, opts)

  ##
  # Amazon Payment Logiout
  @logout: () ->
    document.cookie = "amazon_Login_accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
    amazon.Login.logout()

  ##
  # error case
  # @TODO サーバ側にLogを出力させる
  # @param {String} errorCode
  errorCase: (errorCode) ->
    switch errorCode
      when 'AddressNotModifiable'
        # オーダーリファレンスIDのステータスが正しくない場合はお届け先の住所を変更することができません。
        console.log("オーダーリファレンスIDのステータスが正しくない場合はお届け先の住所を変更することができません")
      when 'BuyerNotAssociated'
        # バイヤーとリファレンスIDが正しく関連付けられていません。
        # ウィジェットを表示する前にバイヤーはログインする必要があります。
        console.log("バイヤーとリファレンスIDが正しく関連付けられていません。")
      when 'BuyerSessionExpired'
        # バイヤーのセッションの有効期限が切れました。
        # ウィジェットを表示する前にバイヤーはログインする必要があります。
        console.log("バイヤーのセッションの有効期限が切れました")
      when 'InvalidAccountStatus'
        # マーチャントID（セラーID）がリクエストを実行する為に適切な状態ではありません。
        # 考えられる理由 ： 制限がかかっているか、正しく登録が完了されていません。
        console.log("マーチャントID（セラーID）がリクエストを実行する為に適切な状態ではありません。")
      when 'InvalidOrderReferenceId'
        # オーダーリファレンスIDが正しくありません。
        console.log("オーダーリファレンスIDが正しくありません。")
      when 'InvalidParameterValue'
        # 指定されたパラメータの値が正しくありません。
        console.log("指定されたパラメータの値が正しくありません。")
      when 'InvalidSellerId'
        # マーチャントID（セラーID）が正しくありません。
        console.log("マーチャントID（セラーID）が正しくありません。")
      when 'MissingParameter'
        # 指定されたパラメータが正しくありません。
        console.log("指定されたパラメータが正しくありません。")
      when 'PaymentMethodNotModifiable'
        # オーダーリファレンスIDのステータスが正しくない場合はお支払い方法を変更することができません。
        console.log("オーダーリファレンスIDのステータスが正しくない場合はお支払い方法を変更することができません。")
      when 'ReleaseEnvironmentMismatch'
        # 使用しているオーダーリファレンスオブジェクトがリリース環境と一致しません。
        console.log("使用しているオーダーリファレンスオブジェクトがリリース環境と一致しません。")
      when 'StaleOrderReference'
        # 使用しているオーダーリファレンスIDがキャンセルされています。
        # キャンセルされたオーダーリファレンスIDでウィジェットを関連付けすることはできません。
        console.log("使用しているオーダーリファレンスIDがキャンセルされています。")
      when 'UnknownError'
        # 不明はエラーが発生しました。
        # Oh My God, いったい何がおきたんだ？
        console.log("不明はエラーが発生しました。")

  ##
  # address book widget
  addressWidget: () ->
    _self = @
    _addressReadyCallback = _widgetCallbacks.addressReadyCallback
    _addressSelectCallback = _widgetCallbacks.addressSelectCallback
    _addressBACreateCallback = _widgetCallbacks.addressBACreateCallback
    _addressORCreateCallback = _widgetCallbacks.addressORCreateCallback
    _setBillingAgreementId = setBillingAgreementId
    _setOrderReferenceId = setOrderReferenceId

    opts = {
      sellerId: _sellerId,
      amazonBillingAgreementId: @billingAgreementId,
      amazonOrderReferenceId: @orderReferenceId,
      design:
        designMode: "responsive"
      onReady: (obj) ->
        if _agreementType is "BillingAgreement"
          _setBillingAgreementId.call(_self, obj)
        else
          _setOrderReferenceId.call(_self, obj)

        if _addressReadyCallback?
          _addressReadyCallback.call(_self, obj)

        return
      onError: (error) ->
        _self.errorCase.call(_self, error.getErrorCode())
      onAddressSelect: (obj) ->
        _self.walletWidget.call _self
        if _addressSelectCallback?
          _addressSelectCallback.call(_self, obj)

        return

    }

    if _agreementType is "BillingAgreement"
      opts.agreementType = _agreementType
      opts.onBillingAgreementCreate = (obj) ->
        _setBillingAgreementId.call(_self, obj)
        if _addressBACreateCallback?
          _addressBACreateCallback.call(_self, obj)
    else
      opts.onOrderReferenceCreate = (obj) ->
        _setOrderReferenceId.call(_self, obj)
        if _addressORCreateCallback?
          _addressORCreateCallback.call(_self, obj)

    @addressObj = new OffAmazonPayments.Widgets.AddressBook(opts).bind(_addressElmId)

  ##
  # Wallet widget
  walletWidget: () ->
    _self = @
    _walletReadyCallback = _widgetCallbacks.walletReadyCallback
    _walletSelectCallback = _widgetCallbacks.walletSelectCallback

    opts = {
      sellerId: _sellerId
      amazonBillingAgreementId: @billingAgreementId,
      amazonOrderReferenceId: @orderReferenceId,
      onReady: (obj) ->
        if _agreementType is "BillingAgreement"
          _self.consentWidget.call _self

        if _walletReadyCallback?
          _walletReadyCallback.call(_self, obj)

        return
      design:
        designMode: "responsive"
      onError: (error) ->
        console.log('OffAmazonPayments.Widgets.Wallet', error.getErrorCode(), error.getErrorMessage())
        _self.errorCase.call(_self, error.getErrorCode())
      onPaymentSelect: (obj) ->
        if _agreementType is "BillingAgreement"
          _self.consentWidget.call _self

        if _walletSelectCallback?
          _walletSelectCallback.call(_self, obj)

        return
    }

    if _agreementType is "BillingAgreement"
      opts.agreementType = _agreementType

    @walletObj = new OffAmazonPayments.Widgets.Wallet(opts).bind(_walletElmId)

  ##
  # 定期check widget
  consentWidget: () ->
    _self = @
    _consentReadyCallback = _widgetCallbacks.consentReadyCallback
    _consentSelectCallback = _widgetCallbacks.consentSelectCallback

    setConsent = (obj) ->
      @consentStatus = (obj.getConsentStatus() is "true")
      hiddenElm = $("##{_consentStatusElmId}")

      if hiddenElm.size() is 0
        hiddenField = $("<input type='hidden' id='#{_consentStatusElmId}' name='#{_consentStatusElmId}'>").attr("value", @consentStatus)
        _formElm.append(hiddenField.prop("outerHTML"))
      else
        hiddenElm.attr("value", @consentStatus)

      return

    opts = {
      sellerId: _sellerId
      amazonBillingAgreementId: @billingAgreementId,
      amazonOrderReferenceId: @orderReferenceId,
      design:
        designMode: "responsive"
      onReady: (obj) ->
        setConsent.call(_self, obj)
        if _consentReadyCallback?
          _consentReadyCallback.call(_self, obj)

        return
      onError: (error) ->
        console.log('OffAmazonPayments.Widgets.Consent', error.getErrorCode(), error.getErrorMessage())
        _self.errorCase.call(_self, error.getErrorCode())
      onConsent: (obj) ->
        setConsent.call(_self, obj)
        if _consentSelectCallback?
          _consentSelectCallback.call(_self, obj)

        return
    }

    @consentObj = new OffAmazonPayments.Widgets.Consent(opts).bind(_consentElmId)

  ##
  # set Amazon BillingAgreementId
  setBillingAgreementId = (obj) ->
    @billingAgreementId = obj.getAmazonBillingAgreementId()
    console.log("AmazonBillingAgrementId", @billingAgreementId)
    hiddenElm = $("##{_billingAgreementElmId}")

    if hiddenElm.size() is 0
      hiddenField = $("<input type='hidden' id='#{_billingAgreementElmId}' name='#{_billingAgreementElmId}'>").attr("value", @billingAgreementId)
      _formElm.append(hiddenField.prop("outerHTML"))
    else
      hiddenElm.attr("value", @billingAgreementId)

    return

  ##
  # set Amazon OrderReferenceId
  setOrderReferenceId = (obj) ->
    @orderReferenceId = obj.getAmazonOrderReferenceId()
    console.log("AmazonOrderReferenceId", @orderReferenceId)
    hiddenElm = $("##{_orderReferenceElmId}")

    if hiddenElm.size() is 0
      hiddenField = $("<input type='hidden' id='#{_orderReferenceElmId}' name='#{_orderReferenceElmId}'>").attr("value", @orderReferenceId)
      _formElm.append(hiddenField.prop("outerHTML"))
    else
      hiddenElm.attr("value", @orderReferenceId)

    return

  ##
  # option parse
  # @param [Object] opts
  configOptsParse = (opts) ->
    if opts.loginElmId?
      _loginElmId = opts.loginElmId

    if opts.addressElmId?
      _addressElmId = opts.addressElmId

    if opts.walletElmId?
      _walletElmId = opts.walletElmId

    if opts.consentElmId?
      _consentElmId = opts.consentElmId

    if opts.addressReadyCallback?
      _widgetCallbacks.addressReadyCallback = opts.addressReadyCallback

    if opts.addressSelectCallback?
      _widgetCallbacks.addressSelectCallback = opts.addressSelectCallback

    if opts.addressBACreateCallback?
      _widgetCallbacks.addressBACreateCallback = opts.addressBACreateCallback

    if opts.addressORCreateCallback?
      _widgetCallbacks.addressORCreateCallback = opts.addressORCreateCallback

    if opts.walletReadyCallback?
      _widgetCallbacks.walletReadyCallback = opts.walletReadyCallback

    if opts.walletSelectCallback?
      _widgetCallbacks.walletSelectCallback = opts.walletSelectCallback

    if opts.consentReadyCallback?
      _widgetCallbacks.consentReadyCallback = opts.consentReadyCallback

    if opts.consentSelectCallback?
      _widgetCallbacks.consentSelectCallback = opts.consentSelectCallback

    return

