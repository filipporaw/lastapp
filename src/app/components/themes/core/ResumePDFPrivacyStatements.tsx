import { View, Text } from "@react-pdf/renderer";
import { styles } from "components/themes/styles";

interface ResumePDFPrivacyStatementsProps {
  italyPrivacy: boolean;
  euPrivacy: boolean;
  fontFamily: string;
  fontSize: string;
}

export const ResumePDFPrivacyStatements = ({
  italyPrivacy,
  euPrivacy,
  fontFamily,
  fontSize,
}: ResumePDFPrivacyStatementsProps) => {
  if (!italyPrivacy && !euPrivacy) {
    return null;
  }

  const statements = [];
  if (italyPrivacy) {
    statements.push(
      "Acconsento al trattamento dei dati personali presenti nel mio curriculum vitae in base all'art.13 del D.Lgs.196/2003 e all'art.13 GDPR 679/16."
    );
  }
  if (euPrivacy) {
    statements.push(
      "According to law 679/2016 of the Regulation of the European Parliament of 27th April 2016, I hereby express my consent to process and use my data provided in this CV and application for recruiting purposes."
    );
  }

  return (
    <View style={{ 
      marginTop: 20,
      position: 'relative',
    }}>
      {statements.map((statement, index) => (
        <View 
          key={index} 
          style={{ 
            position: 'absolute',
            top: index * 12, // 12pt di spazio tra le righe
            left: 0,
            right: 0,
          }}
        >
          <Text
            style={{
              fontSize: 6,
              color: "#9CA3AF",
              fontFamily,
              lineHeight: 1.4,
            }}
          >
            {statement}
          </Text>
        </View>
      ))}
    </View>
  );
};
