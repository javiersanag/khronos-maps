// Type declarations for next-intl message files
type Messages = typeof import('../messages/es.json');

declare global {
    // Use this type for strict message key checking across the app
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntlMessages extends Messages { }
}
