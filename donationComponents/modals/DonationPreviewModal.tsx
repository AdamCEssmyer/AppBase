import React from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { DateHelper, CurrencyHelper } from "../../helpers";
import { StripeDonationInterface } from "../../interfaces";

interface Props {
  show: boolean;
  onHide: () => void;
  handleDonate: (message: string) => void;
  donation: StripeDonationInterface;
  donationType: string;
  paymentMethodName: string;
  funds: any;
  payFee: number;
}

export const DonationPreviewModal: React.FC<Props> = (props) => {
  const donationType: any = {once: "One-time Donation", recurring: "Recurring Donation"};
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const handleClick = () => {
    setLoading(true);
    let message = "Thank you for your donation.";
    if (props.donationType === "recurring") message = "Recurring donation created. " + message;
    props.handleDonate(message);
  }

  const formatInterval = () => {
    const count = props.donation.interval.interval_count;
    const interval = props.donation.interval.interval;
    let result = `${count} ${interval}`;
    return count > 1 ? result + "s" : result;
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Donation Preview
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table>
          <tbody>
            <tr><td>Name:</td><td>{props.donation.person.name}</td></tr>
            <tr><td>Payment Method:</td><td className="capitalize">{props.paymentMethodName}</td></tr>
            <tr><td>Type:</td><td>{donationType[props.donationType]}</td></tr>
            {props.donationType === "once"
              && <tr><td>Donation Date:</td><td>{DateHelper.formatHtml5Date(new Date(props.donation.billing_cycle_anchor))}</td></tr>
            }
            <tr><td>Notes:</td><td>{props.donation.notes}</td></tr>
            { props.donationType === "recurring"
              && <>
                <tr><td>Starting On:</td><td>{DateHelper.formatHtml5Date(new Date(props.donation.billing_cycle_anchor))}</td></tr>
                <tr><td>Recurring Every:</td><td className="capitalize">{formatInterval()}</td></tr>
              </>
            }
            <tr><td>Funds:</td><td>{props.donation.funds.map((fund: any, i: number) => <p key={i}>{CurrencyHelper.formatCurrency(fund.amount)} - {fund.name}</p>)}</td></tr>
            { props.payFee > 0 && <tr><td>Transaction Fee:</td><td>{CurrencyHelper.formatCurrency(props.payFee)}</td></tr> }
            <tr><td>Total:</td><td><h4>{CurrencyHelper.formatCurrency(props.donation.amount)}</h4></td></tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer bsPrefix="modal-footer justify-content-center">
        <Button onClick={props.onHide} variant="secondary" aria-label="cancel-button">Cancel</Button>
        <Button onClick={handleClick} variant="primary" aria-label="donate-button" disabled={isLoading}>Donate</Button>
      </Modal.Footer>
    </Modal>
  );
}
