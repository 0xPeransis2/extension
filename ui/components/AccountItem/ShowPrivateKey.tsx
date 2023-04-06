import React, { ReactElement, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { AccountTotal } from "@tallyho/tally-background/redux-slices/selectors"
import { exportPrivateKey } from "@tallyho/tally-background/redux-slices/keyrings"
import { setSnackbarMessage } from "@tallyho/tally-background/redux-slices/ui"
import SharedSlideUpMenuPanel from "../Shared/SharedSlideUpMenuPanel"
import SharedWarningMessage from "../Shared/SharedWarningMessage"
import SharedButton from "../Shared/SharedButton"
import SharedCheckbox from "../Shared/SharedCheckbox"
import SharedAccountItemSummary from "../Shared/SharedAccountItemSummary"
import SharedSecretText from "../Shared/SharedSecretText"
import { useBackgroundDispatch } from "../../hooks"
import SharedSlideUpMenu from "../Shared/SharedSlideUpMenu"

interface ShowPrivateKeyProps {
  account: AccountTotal
}

export default function ShowPrivateKey({
  account,
}: ShowPrivateKeyProps): ReactElement {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.accountItem.showPrivateKey",
  })
  const { t: tShared } = useTranslation("translation", { keyPrefix: "shared" })
  const dispatch = useBackgroundDispatch()

  const [privateKey, setPrivateKey] = useState("")
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  // When the user clicks the disabled button should see a message about the selection of the checkbox
  const [showInvalidMessage, setShowInvalidMessage] = useState(false)
  const [showExplainer, setShowExplainer] = useState(false)

  useEffect(() => {
    const fetchPrivateKey = async () => {
      const key = (await dispatch(
        exportPrivateKey(account.address)
      )) as unknown as string | null

      if (key) {
        setPrivateKey(key)
      }
    }

    fetchPrivateKey()
  }, [dispatch, account.address])

  return (
    <>
      <SharedSlideUpMenuPanel header={t("header")} icon="icons/s/key.svg">
        <div className="content simple_text">
          <SharedWarningMessage text={t("warningMessage")} />
          <div className="exporting_container">
            <span className="header">{t("exportingPrivateKey.header")}</span>
            <div className="account_container">
              <SharedAccountItemSummary accountTotal={account} />
            </div>
            {showPrivateKey ? (
              <>
                <SharedSecretText text={privateKey} label={t("privateKey")} />
                <SharedButton
                  type="tertiary"
                  size="small"
                  iconMedium="copy"
                  onClick={() => {
                    navigator.clipboard.writeText(privateKey)
                    dispatch(
                      setSnackbarMessage(t("exportingPrivateKey.copySuccess"))
                    )
                  }}
                  center
                >
                  {t("exportingPrivateKey.copyBtn")}
                </SharedButton>
              </>
            ) : (
              <div className="confirmation_container">
                <SharedCheckbox
                  label={t("exportingPrivateKey.confirmationDesc")}
                  message={t("exportingPrivateKey.invalidMessage")}
                  value={isConfirmed}
                  invalid={showInvalidMessage && !isConfirmed}
                  onChange={(value) => {
                    setIsConfirmed(value)
                    setShowInvalidMessage(false)
                  }}
                />
                <div>
                  <SharedButton
                    type="primary"
                    size="medium"
                    isDisabled={!isConfirmed}
                    hideEvents={false}
                    onClick={() => {
                      if (isConfirmed) {
                        setShowPrivateKey(true)
                      } else {
                        setShowInvalidMessage(true)
                      }
                    }}
                  >
                    {t("exportingPrivateKey.showBtn")}
                  </SharedButton>
                </div>
              </div>
            )}
          </div>
          <SharedButton
            type="tertiaryGray"
            size="small"
            onClick={() => setShowExplainer(true)}
          >
            {t("privateKeyInfo")}
          </SharedButton>
        </div>
      </SharedSlideUpMenuPanel>
      <SharedSlideUpMenu
        size="auto"
        isOpen={showExplainer}
        close={() => setShowExplainer(false)}
      >
        <div className="explainer">
          <h3 className="simple_text explainer_header">
            {t("explainer.header")}
          </h3>
          {/* TODO: Explainer text is WIP */}
          <p className="simple_text">{t("explainer.text1")}</p>
          <p className="simple_text bold">{t("explainer.text2")}</p>
          <p className="simple_text">{t("explainer.text3")}</p>
          <div className="explainer_buttons">
            <SharedButton
              size="medium"
              type="tertiary"
              iconSmall="close"
              onClick={() => setShowExplainer(false)}
            >
              {tShared("close")}
            </SharedButton>
            {/* TODO: add link to "Read more" */}
            <SharedButton size="medium" type="tertiary" iconSmall="new-tab">
              {tShared("readMore")}
            </SharedButton>
          </div>
        </div>
      </SharedSlideUpMenu>
      <style jsx>
        {`
          .content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding: 0 24px;
          }
          .account_container {
            display: flex;
            width: 100%;
            border-bottom: 1px solid #183736;
            padding: 8px 0 24px;
          }
          .exporting_container {
            box-sizing: border-box;
            width: 100%;
            height: 342px;
            padding: 16px 24px 24px;
            background: var(--green-120);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
          }
          .confirmation_container {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            margin-top: 16px;
          }
          .explainer {
            font-family: "Segment";
            padding: 0 24px 5px;
            margin-top: -20px;
          }
          .explainer_header {
            color: var(--white);
          }
          .bold {
            font-weight: 600;
            color: var(--white);
          }
          .explainer_buttons {
            display: flex;
            justify-content: space-between;
          }
        `}
      </style>
    </>
  )
}
