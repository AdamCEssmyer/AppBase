import React from "react";
import { Table } from "react-bootstrap";
import { DisplayBox } from "../../components";
import { ApiHelper, UserHelper, CurrencyHelper, DateHelper } from "../../helpers";
import { Permissions, SubscriptionInterface } from "../../interfaces";
import { RecurringDonationsEdit } from ".";

interface Props { customerId: string, paymentMethods: any };

export const RecurringDonations: React.FC<Props> = (props) => {
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionInterface[]>([]);
  const [mode, setMode] = React.useState("display");
  const [editSubscription, setEditSubscription] = React.useState<SubscriptionInterface>();

  const loadData = () => {
    ApiHelper.get("/customers/" + props.customerId + "/subscriptions", "GivingApi").then(subResult => {
      const subs: SubscriptionInterface[] = [];
      const requests = subResult.data.map((s: any) => ApiHelper.get("/subscriptionfunds?subscriptionId=" + s.id, "GivingApi").then(subFunds => {
        s.funds = subFunds;
        subs.push(s);
      }));
      return Promise.all(requests).then(() => {
        setSubscriptions(subs);
      });
    });
  }

  const handleUpdate = () => { loadData(); setMode("display"); }

  const handleEdit = (sub: SubscriptionInterface) => (e: React.MouseEvent) => {
    e.preventDefault();
    setEditSubscription(sub);
    setMode("edit");
  }

  const getPaymentMethod = (sub: SubscriptionInterface) => {
    const pm = props.paymentMethods.find((pm: any) => pm.id === (sub.default_payment_method || sub.default_source));
    if (!pm) return 'Payment method not found.';
    return `${pm.name} ****${pm.last4}`;
  }

  const getInterval = (subscription: SubscriptionInterface) => {
    let interval = subscription.plan.interval_count + " " + subscription.plan.interval;
    return subscription.plan.interval_count > 1 ? interval + "s" : interval;
  }

  const getFunds = (subscription: SubscriptionInterface) => {
    let result: JSX.Element[] = [];
    subscription.funds.forEach((fund: any) => {
      result.push(
        <div key={subscription.id + fund.id}>
          {fund.name} <span style={{float: "right"}}>{CurrencyHelper.formatCurrency(fund.amount)}</span>
        </div>
      );
    });
    const total = (subscription.plan.amount / 100);
    result.push(
      <div key={subscription.id + "-total"} style={{borderTop: "solid #dee2e6 1px"}}>
        Total <span style={{float: "right"}}>{CurrencyHelper.formatCurrency(total)}</span>
      </div>
    );
    return result;
  }

  const getEditOptions = (sub: SubscriptionInterface) => {
    if (!UserHelper.checkAccess(Permissions.givingApi.settings.edit) && process.env.REACT_APP_NAME !== "B1App") return null;
    return <a aria-label="edit-button" onClick={handleEdit(sub)} href="about:blank"><i className="fas fa-pencil-alt"></i></a>;
  }

  const getTableHeader = () => {
    let result: JSX.Element[] = [];
    result.push(<tr key="header"><th>Start Date</th><th>Amount</th><th>Interval</th><th>Payment Method</th><th>Edit</th></tr>);
    return result;
  }

  const getTableRows = () => {
    let rows: JSX.Element[] = [];

    subscriptions.forEach((sub: any) => {
      rows.push(
        <tr key={sub.id}>
          <td>{DateHelper.prettyDate(new Date(sub.billing_cycle_anchor * 1000))}</td>
          <td>{getFunds(sub)}</td>
          <td>Every {getInterval(sub)}</td>
          <td className="capitalize">{getPaymentMethod(sub)}</td>
          <td className="text-right">{getEditOptions(sub)}</td>
        </tr>
      );
    });
    return rows;
  }

  const getSubscriptionsTable = () => (
    <Table>
      <thead>{getTableHeader()}</thead>
      <tbody>{getTableRows()}</tbody>
    </Table>
  )

  React.useEffect(loadData, []);

  if (!subscriptions.length) return null;
  if (mode === "display") {
    return (
      <DisplayBox data-cy="recurring-donations" headerIcon="fas fa-credit-card" headerText="Recurring Donations">
        {getSubscriptionsTable()}
      </DisplayBox>
    );
  }
  if (mode === "edit" && editSubscription) {
    return (
      <RecurringDonationsEdit customerId={props.customerId} paymentMethods={props.paymentMethods} editSubscription={editSubscription} subscriptionUpdated={handleUpdate} />
    );
  }
}
