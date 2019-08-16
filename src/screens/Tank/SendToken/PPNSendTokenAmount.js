// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
import * as React from 'react';
import { connect } from 'react-redux';
import { TouchableOpacity, Keyboard } from 'react-native';
import t from 'tcomb-form-native';
import styled from 'styled-components/native';
import { createStructuredSelector } from 'reselect';

// components
import ContainerWithHeader from 'components/Layout/ContainerWithHeader';
import { Wrapper } from 'components/Layout';
import Button from 'components/Button';
import { TextLink, Label, BaseText } from 'components/Typography';

// utils
import { formatAmount, getCurrencySymbol, formatMoney } from 'utils/common';
import { fontSizes, spacing, UIColors } from 'utils/variables';
import { getRate } from 'utils/assets';
import { makeAmountForm, getAmountFormFields } from 'utils/formHelpers';

// types
import type { NavigationScreenProp } from 'react-navigation';
import type { TokenTransactionPayload } from 'models/Transaction';
import type { Rates } from 'models/Asset';

// constants
import { SEND_TOKEN_CONFIRM } from 'constants/navigationConstants';
import { defaultFiatCurrency } from 'constants/assetsConstants';

// selectors
import { availableStakeSelector } from 'selectors/paymentNetwork';


const ActionsWrapper = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SendTokenDetails = styled.View``;

const SendTokenDetailsValue = styled(BaseText)`
  font-size: ${fontSizes.small};
  margin-bottom: 8px;
`;

const HelperText = styled(BaseText)`
  font-size: ${fontSizes.small};
  margin-bottom: ${spacing.rhythm / 2}px;
  color: ${UIColors.placeholderTextColor};
`;

const BackgroundWrapper = styled.View`
  background-color: ${UIColors.defaultBackgroundColor};
  flex: 1;
`;

const FooterWrapper = styled.View`
  width: 100%;
  padding: ${spacing.large}px;
`;

type Props = {
  token: string;
  address: string,
  navigation: NavigationScreenProp<*>,
  isVisible: boolean,
  formValues?: Object,
  availableStake: number,
  session: Object,
  rates: Rates,
  baseFiatCurrency: string,
};

type State = {
  value: ?{
    amount: ?string,
  },
};

const { Form } = t.form;
const MIN_TX_AMOUNT = 0.000000000000000001;

class PPNSendTokenAmount extends React.Component<Props, State> {
  _form: t.form;
  assetData: Object;
  formSubmitted: boolean = false;
  receiver: string;
  source: string;

  constructor(props: Props) {
    super(props);
    this.assetData = props.navigation.getParam('assetData', {});
    this.receiver = props.navigation.getParam('receiver', '');
    this.source = props.navigation.getParam('source', '');

    this.state = {
      value: null,
    };
  }

  handleChange = (value: Object) => {
    this.setState({ value });
  };

  handleFormSubmit = () => {
    this.formSubmitted = true;
    const value = this._form.getValue();
    const { navigation } = this.props;

    if (!value) return;
    const transactionPayload: TokenTransactionPayload = {
      to: this.receiver,
      amount: value.amount,
      gasLimit: 0,
      gasPrice: 0,
      txFeeInWei: 0,
      usePPN: true,
      symbol: this.assetData.token,
      contractAddress: this.assetData.contractAddress,
      decimals: this.assetData.decimals,
    };

    Keyboard.dismiss();
    navigation.navigate(SEND_TOKEN_CONFIRM, {
      transactionPayload,
      source: this.source,
    });
  };

  useMaxValue = () => {
    const { availableStake } = this.props;
    this.setState({
      value: {
        amount: formatAmount(availableStake),
      },
    });
  };

  render() {
    const { value } = this.state;
    const {
      session,
      availableStake,
      rates,
      baseFiatCurrency,
    } = this.props;

    const { token, icon, decimals } = this.assetData;
    const fiatCurrency = baseFiatCurrency || defaultFiatCurrency;
    const currencySymbol = getCurrencySymbol(fiatCurrency);

    // balance
    const balance = availableStake;
    const formattedBalance = formatAmount(balance);

    // balance in fiat
    const totalInFiat = balance * getRate(rates, 'PLR', fiatCurrency);
    const formattedBalanceInFiat = formatMoney(totalInFiat);

    // max amount
    const maxAmount = Number(balance);

    // value
    const currentValue = (!!value && !!parseFloat(value.amount)) ? parseFloat(value.amount) : 0;

    // value in fiat
    const valueInFiat = currentValue * getRate(rates, 'PLR', fiatCurrency);
    const formattedValueInFiat = formatMoney(valueInFiat);
    const valueInFiatOutput = `${currencySymbol}${formattedValueInFiat}`;

    // form
    const formStructure = makeAmountForm(maxAmount, MIN_TX_AMOUNT, true, this.formSubmitted, decimals);
    const formFields = getAmountFormFields({ icon, currency: token, valueInFiatOutput });

    return (
      <ContainerWithHeader
        headerProps={{ centerItems: [{ title: `Send ${this.assetData.token} via PPN` }] }}
        keyboardAvoidFooter={!!value && !!parseFloat(value.amount) && (
          <FooterWrapper>
            <Button
              disabled={!session.isOnline}
              small
              flexRight
              title="Next"
              onPress={this.handleFormSubmit}
            />
          </FooterWrapper>
          )
        }
      >
        <BackgroundWrapper>
          <Wrapper regularPadding>
            <Form
              ref={node => { this._form = node; }}
              type={formStructure}
              options={formFields}
              value={value}
              onChange={this.handleChange}
            />
            <ActionsWrapper>
              <SendTokenDetails>
                <Label small>Available Balance</Label>
                <SendTokenDetailsValue>
                  {formattedBalance} {token}
                  <HelperText> ({currencySymbol}{formattedBalanceInFiat})</HelperText>
                </SendTokenDetailsValue>
              </SendTokenDetails>
              <TouchableOpacity onPress={this.useMaxValue}>
                <TextLink>Send All</TextLink>
              </TouchableOpacity>
            </ActionsWrapper>
          </Wrapper>
        </BackgroundWrapper>
      </ContainerWithHeader>
    );
  }
}

const mapStateToProps = ({
  session: { data: session },
  rates: { data: rates },
  appSettings: { data: { baseFiatCurrency } },
}) => ({
  rates,
  session,
  baseFiatCurrency,
});

const structuredSelector = createStructuredSelector({
  availableStake: availableStakeSelector,
});

const combinedMapStateToProps = (state) => ({
  ...structuredSelector(state),
  ...mapStateToProps(state),
});

export default connect(combinedMapStateToProps)(PPNSendTokenAmount);