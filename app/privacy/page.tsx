import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, UserCheck } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-balance">Privacy & Data Protection</h1>
          <p className="text-muted-foreground">Your privacy and mental health data security are our top priorities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Data Encryption
              </CardTitle>
              <CardDescription>All your conversations and mood data are encrypted</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use industry-standard encryption to protect your personal information. Your chat messages, mood
                entries, and personal data are encrypted both in transit and at rest.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Secure Authentication
              </CardTitle>
              <CardDescription>Protected access with secure login systems</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your account is protected with secure authentication. We use advanced security measures to ensure only
                you can access your mental wellness data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Data Transparency
              </CardTitle>
              <CardDescription>Full visibility into what data we collect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We collect only the data necessary to provide mental wellness support: your mood entries, chat
                conversations, and basic profile information. No data is shared with third parties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-600" />
                Your Rights
              </CardTitle>
              <CardDescription>Complete control over your personal data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You have the right to access, export, or delete your data at any time. Visit your account settings to
                manage your privacy preferences.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Information We Collect</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Mood entries and emotional wellness data you provide</li>
                <li>• Chat conversations with our AI companion</li>
                <li>• Basic account information (email, profile preferences)</li>
                <li>• Usage analytics to improve our services</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How We Use Your Information</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Provide personalized mental wellness support</li>
                <li>• Generate insights about your mood patterns</li>
                <li>• Improve our AI responses and recommendations</li>
                <li>• Ensure platform security and prevent abuse</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Data Protection</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• All data is encrypted using AES-256 encryption</li>
                <li>• We never share your personal data with third parties</li>
                <li>• Data is stored securely with regular security audits</li>
                <li>• You can delete your account and all data at any time</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Your Rights</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Access and download all your personal data</li>
                <li>• Request correction of inaccurate information</li>
                <li>• Delete your account and all associated data</li>
                <li>• Opt out of non-essential data processing</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Contact Us</h3>
              <p className="text-sm text-muted-foreground">
                If you have any questions about this Privacy Policy or your data, please contact us at
                privacy@saathi.app
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
