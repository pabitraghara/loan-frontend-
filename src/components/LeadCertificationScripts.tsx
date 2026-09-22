'use client';

import Script from 'next/script';

/**
 * Jornaya LeadiD and TrustedForm.
 *
 * Both write into hidden inputs that the tracking layer reads on every step
 * submission. Without these certificates a TCPA claim is close to
 * indefensible, so they load on every page that renders the form.
 */
export function LeadCertificationScripts() {
  const jornayaCampaign = process.env.NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID;
  const trustedFormEnabled = process.env.NEXT_PUBLIC_TRUSTEDFORM_ENABLED !== 'false';

  return (
    <>
      {/* Hidden inputs the vendors populate and getTracking() reads. */}
      <input type="hidden" id="leadid_token" name="universal_leadid" value="" readOnly />
      <input type="hidden" name="xxTrustedFormCertUrl" value="" readOnly />
      <input type="hidden" name="xxTrustedFormToken" value="" readOnly />

      {jornayaCampaign && (
        <Script
          id="jornaya-leadid"
          strategy="afterInteractive"
          src={`https://create.lidstatic.com/campaign/${jornayaCampaign}.js?snippet_version=2`}
        />
      )}

      {trustedFormEnabled && (
        <Script id="trustedform" strategy="afterInteractive">
          {`
            (function() {
              var tf = document.createElement('script');
              tf.type = 'text/javascript';
              tf.async = true;
              tf.src = 'https://api.trustedform.com/trustedform.js'
                + '?field=xxTrustedFormCertUrl&ping_field=xxTrustedFormPingUrl&l='
                + new Date().getTime() + Math.random();
              var s = document.getElementsByTagName('script')[0];
              s.parentNode.insertBefore(tf, s);
            })();
          `}
        </Script>
      )}
      <noscript>
        <img alt="" src="https://api.trustedform.com/ns.gif" />
      </noscript>
    </>
  );
}
