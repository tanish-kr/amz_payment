(function() {
  var AmazonPayment;

  AmazonPayment = (function() {
    var configOptsParse, setBillingAgreementId, setOrderReferenceId, _addressElmId, _agreementType, _billingAgreementElmId, _clientId, _consentElmId, _consentStatusElmId, _formElm, _language, _loginElmId, _orderReferenceElmId, _sellerId, _walletElmId, _widgetCallbacks;

    _sellerId = null;

    _clientId = null;

    _language = "ja_JP";

    _loginElmId = "AmazonPayButton";

    _addressElmId = "addressBookWidgetDiv";

    _walletElmId = "walletWidgetDiv";

    _consentElmId = "consentWidgetDiv";

    _formElm = null;

    _billingAgreementElmId = "billing_agreement_id";

    _orderReferenceElmId = "order_reference_id";

    _consentStatusElmId = "amz_consent_status";

    _agreementType = null;

    AmazonPayment.billingAgreementId = null;

    AmazonPayment.orderReferenceId = null;

    AmazonPayment.loginButton = null;

    AmazonPayment.addressObj = null;

    AmazonPayment.walletObj = null;

    AmazonPayment.consentObj = null;

    AmazonPayment.consentStatus = null;

    AmazonPayment.amazonToken = null;

    AmazonPayment.authRequest = null;

    _widgetCallbacks = {
      addressReadyCallback: null,
      addressSelectCallback: null,
      addressBACreateCallback: null,
      addressORCreateCallback: null,
      walletReadyCallback: null,
      walletSelectCallback: null,
      consentReadyCallback: null,
      consentSelectCallback: null
    };

    function AmazonPayment(sellerId, clientId, formElmId, type, opts) {
      if (formElmId == null) {
        formElmId = "form";
      }
      if (type == null) {
        type = "periodic";
      }
      if (opts == null) {
        opts = {};
      }
      _sellerId = sellerId;
      _clientId = clientId;
      _formElm = $(formElmId);
      configOptsParse.call(this, opts);
      window.amazon.Login.setClientId(_clientId);
      window.amazon.Login.setLanguage(_language);
      if (type === "periodic") {
        _agreementType = "BillingAgreement";
      } else {
        _agreementType = null;
      }
    }

    AmazonPayment.prototype.setAgreement = function(type) {
      if (type == null) {
        type = "periodic";
      }
      if (type === "periodic") {
        return _agreementType = "BillingAgreement";
      } else {
        return _agreementType = null;
      }
    };

    AmazonPayment.prototype.loginWidget = function(scope, authCallback, type, color, size, signInCallback, popup) {
      var opts, _authRequest, _self, _setBillingAgreementId, _setOrderReferenceId;
      if (type == null) {
        type = "LwA";
      }
      if (color == null) {
        color = "LightGray";
      }
      if (size == null) {
        size = "medium";
      }
      if (signInCallback == null) {
        signInCallback = null;
      }
      if (popup == null) {
        popup = true;
      }
      _self = this;
      _setBillingAgreementId = setBillingAgreementId;
      _setOrderReferenceId = setOrderReferenceId;
      _authRequest = this.authRequest;
      opts = {
        type: type,
        color: color,
        size: size,
        authorization: function() {
          var loginOptions;
          loginOptions = {
            scope: scope,
            popup: popup
          };
          return _authRequest = amazon.Login.authorize(loginOptions, authCallback);
        },
        onSignIn: function(obj) {
          console.log("OffAmazonPayments.Button.onSignIn", obj);
          if (_agreementType === "BillingAgreement" && typeof obj.getAmazonBillingAgreementId !== "undefined") {
            _setBillingAgreementId.call(_self, obj);
          } else {
            _setOrderReferenceId.call(_self, obj);
          }
          if (signInCallback != null) {
            return signInCallback.call(_self, obj);
          }
        }
      };
      if (_agreementType === "BillingAgreement") {
        opts.agreementType = _agreementType;
      }
      return this.loginButton = OffAmazonPayments.Button(_loginElmId, _sellerId, opts);
    };

    AmazonPayment.logout = function() {
      document.cookie = "amazon_Login_accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      return amazon.Login.logout();
    };

    AmazonPayment.prototype.errorCase = function(errorCode) {
      switch (errorCode) {
        case 'AddressNotModifiable':
          console.log("オーダーリファレンスIDのステータスが正しくない場合はお届け先の住所を変更することができません");
          return location.reload();
        case 'BuyerNotAssociated':
          console.log("バイヤーとリファレンスIDが正しく関連付けられていません。");
          return location.reload();
        case 'BuyerSessionExpired':
          console.log("バイヤーのセッションの有効期限が切れました");
          return location.reload();
        case 'InvalidAccountStatus':
          console.log("マーチャントID（セラーID）がリクエストを実行する為に適切な状態ではありません。");
          return location.reload();
        case 'InvalidOrderReferenceId':
          console.log("オーダーリファレンスIDが正しくありません。");
          return location.reload();
        case 'InvalidParameterValue':
          console.log("指定されたパラメータの値が正しくありません。");
          return location.reload();
        case 'InvalidSellerId':
          console.log("マーチャントID（セラーID）が正しくありません。");
          return location.reload();
        case 'MissingParameter':
          console.log("指定されたパラメータが正しくありません。");
          return location.reload();
        case 'PaymentMethodNotModifiable':
          console.log("オーダーリファレンスIDのステータスが正しくない場合はお支払い方法を変更することができません。");
          return location.reload();
        case 'ReleaseEnvironmentMismatch':
          console.log("使用しているオーダーリファレンスオブジェクトがリリース環境と一致しません。");
          return location.reload();
        case 'StaleOrderReference':
          console.log("使用しているオーダーリファレンスIDがキャンセルされています。");
          return location.reload();
        case 'UnknownError':
          console.log("不明はエラーが発生しました。");
          return location.reload();
      }
    };

    AmazonPayment.prototype.addressWidget = function() {
      var opts, _addressBACreateCallback, _addressORCreateCallback, _addressReadyCallback, _addressSelectCallback, _self, _setBillingAgreementId, _setOrderReferenceId;
      _self = this;
      _addressReadyCallback = _widgetCallbacks.addressReadyCallback;
      _addressSelectCallback = _widgetCallbacks.addressSelectCallback;
      _addressBACreateCallback = _widgetCallbacks.addressBACreateCallback;
      _addressORCreateCallback = _widgetCallbacks.addressORCreateCallback;
      _setBillingAgreementId = setBillingAgreementId;
      _setOrderReferenceId = setOrderReferenceId;
      opts = {
        sellerId: _sellerId,
        amazonBillingAgreementId: this.billingAgreementId,
        amazonOrderReferenceId: this.orderReferenceId,
        design: {
          designMode: "responsive"
        },
        onReady: function(obj) {
          if (_agreementType === "BillingAgreement") {
            _setBillingAgreementId.call(_self, obj);
          } else {
            _setOrderReferenceId.call(_self, obj);
          }
          if (_addressReadyCallback != null) {
            _addressReadyCallback.call(_self, obj);
          }
        },
        onError: function(error) {
          return _self.errorCase.call(_self, error.getErrorCode());
        },
        onAddressSelect: function(obj) {
          _self.walletWidget.call(_self);
          if (_addressSelectCallback != null) {
            _addressSelectCallback.call(_self, obj);
          }
        }
      };
      if (_agreementType === "BillingAgreement") {
        opts.agreementType = _agreementType;
        opts.onBillingAgreementCreate = function(obj) {
          _setBillingAgreementId.call(_self, obj);
          if (_addressBACreateCallback != null) {
            return _addressBACreateCallback.call(_self, obj);
          }
        };
      } else {
        opts.onOrderReferenceCreate = function(obj) {
          _setOrderReferenceId.call(_self, obj);
          if (_addressORCreateCallback != null) {
            return _addressORCreateCallback.call(_self, obj);
          }
        };
      }
      return this.addressObj = new OffAmazonPayments.Widgets.AddressBook(opts).bind(_addressElmId);
    };

    AmazonPayment.prototype.walletWidget = function() {
      var opts, _self, _walletReadyCallback, _walletSelectCallback;
      _self = this;
      _walletReadyCallback = _widgetCallbacks.walletReadyCallback;
      _walletSelectCallback = _widgetCallbacks.walletSelectCallback;
      opts = {
        sellerId: _sellerId,
        amazonBillingAgreementId: this.billingAgreementId,
        amazonOrderReferenceId: this.orderReferenceId,
        onReady: function(obj) {
          if (_agreementType === "BillingAgreement") {
            _self.consentWidget.call(_self);
          }
          if (_walletReadyCallback != null) {
            _walletReadyCallback.call(_self, obj);
          }
        },
        design: {
          designMode: "responsive"
        },
        onError: function(error) {
          console.log('OffAmazonPayments.Widgets.Wallet', error.getErrorCode(), error.getErrorMessage());
          return _self.errorCase.call(_self, error.getErrorCode());
        },
        onPaymentSelect: function(obj) {
          if (_agreementType === "BillingAgreement") {
            _self.consentWidget.call(_self);
          }
          if (_walletSelectCallback != null) {
            _walletSelectCallback.call(_self, obj);
          }
        }
      };
      if (_agreementType === "BillingAgreement") {
        opts.agreementType = _agreementType;
      }
      return this.walletObj = new OffAmazonPayments.Widgets.Wallet(opts).bind(_walletElmId);
    };

    AmazonPayment.prototype.consentWidget = function() {
      var opts, setConsent, _consentReadyCallback, _consentSelectCallback, _self;
      _self = this;
      _consentReadyCallback = _widgetCallbacks.consentReadyCallback;
      _consentSelectCallback = _widgetCallbacks.consentSelectCallback;
      setConsent = function(obj) {
        var hiddenElm, hiddenField;
        this.consentStatus = obj.getConsentStatus() === "true";
        hiddenElm = $("#" + _consentStatusElmId);
        if (hiddenElm.size() === 0) {
          hiddenField = $("<input type='hidden' id='" + _consentStatusElmId + "' name='" + _consentStatusElmId + "'>").attr("value", this.consentStatus);
          _formElm.append(hiddenField.prop("outerHTML"));
        } else {
          hiddenElm.attr("value", this.consentStatus);
        }
      };
      opts = {
        sellerId: _sellerId,
        amazonBillingAgreementId: this.billingAgreementId,
        amazonOrderReferenceId: this.orderReferenceId,
        design: {
          designMode: "responsive"
        },
        onReady: function(obj) {
          setConsent.call(_self, obj);
          if (_consentReadyCallback != null) {
            _consentReadyCallback.call(_self, obj);
          }
        },
        onError: function(error) {
          console.log('OffAmazonPayments.Widgets.Consent', error.getErrorCode(), error.getErrorMessage());
          return _self.errorCase.call(_self, error.getErrorCode());
        },
        onConsent: function(obj) {
          setConsent.call(_self, obj);
          if (_consentSelectCallback != null) {
            _consentSelectCallback.call(_self, obj);
          }
        }
      };
      return this.consentObj = new OffAmazonPayments.Widgets.Consent(opts).bind(_consentElmId);
    };

    setBillingAgreementId = function(obj) {
      var hiddenElm, hiddenField;
      this.billingAgreementId = obj.getAmazonBillingAgreementId();
      console.log("AmazonBillingAgrementId", this.billingAgreementId);
      hiddenElm = $("#" + _billingAgreementElmId);
      if (hiddenElm.size() === 0) {
        hiddenField = $("<input type='hidden' id='" + _billingAgreementElmId + "' name='" + _billingAgreementElmId + "'>").attr("value", this.billingAgreementId);
        _formElm.append(hiddenField.prop("outerHTML"));
      } else {
        hiddenElm.attr("value", this.billingAgreementId);
      }
    };

    setOrderReferenceId = function(obj) {
      var hiddenElm, hiddenField;
      this.orderReferenceId = obj.getAmazonOrderReferenceId();
      console.log("AmazonOrderReferenceId", this.orderReferenceId);
      hiddenElm = $("#" + _orderReferenceElmId);
      if (hiddenElm.size() === 0) {
        hiddenField = $("<input type='hidden' id='" + _orderReferenceElmId + "' name='" + _orderReferenceElmId + "'>").attr("value", this.orderReferenceId);
        _formElm.append(hiddenField.prop("outerHTML"));
      } else {
        hiddenElm.attr("value", this.orderReferenceId);
      }
    };

    configOptsParse = function(opts) {
      if (opts.loginElmId != null) {
        _loginElmId = opts.loginElmId;
      }
      if (opts.addressElmId != null) {
        _addressElmId = opts.addressElmId;
      }
      if (opts.walletElmId != null) {
        _walletElmId = opts.walletElmId;
      }
      if (opts.consentElmId != null) {
        _consentElmId = opts.consentElmId;
      }
      if (opts.addressReadyCallback != null) {
        _widgetCallbacks.addressReadyCallback = opts.addressReadyCallback;
      }
      if (opts.addressSelectCallback != null) {
        _widgetCallbacks.addressSelectCallback = opts.addressSelectCallback;
      }
      if (opts.addressBACreateCallback != null) {
        _widgetCallbacks.addressBACreateCallback = opts.addressBACreateCallback;
      }
      if (opts.addressORCreateCallback != null) {
        _widgetCallbacks.addressORCreateCallback = opts.addressORCreateCallback;
      }
      if (opts.walletReadyCallback != null) {
        _widgetCallbacks.walletReadyCallback = opts.walletReadyCallback;
      }
      if (opts.walletSelectCallback != null) {
        _widgetCallbacks.walletSelectCallback = opts.walletSelectCallback;
      }
      if (opts.consentReadyCallback != null) {
        _widgetCallbacks.consentReadyCallback = opts.consentReadyCallback;
      }
      if (opts.consentSelectCallback != null) {
        _widgetCallbacks.consentSelectCallback = opts.consentSelectCallback;
      }
    };

    return AmazonPayment;

  })();

}).call(this);
