'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { profileApi, ProfileData, TrustData } from '@/lib/api/profile';
import { Camera, Upload, Shield, CheckCircle, XCircle, AlertCircle, UserPlus } from 'lucide-react';

// Ethiopian regions
const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'Somali',
  'South West',
  'Tigray',
  'Southern'
];

// ID types
const ID_TYPES = [
  'ID_CARD',
  'PASSPORT',
  'DRIVING_LICENSE'
];

// Trust level colors and descriptions
const TRUST_LEVELS = {
  NEW: { color: 'bg-gray-100 text-gray-800', label: 'New', description: 'Phone verified' },
  BASIC: { color: 'bg-blue-100 text-blue-800', label: 'Basic', description: 'ID verified' },
  VERIFIED: { color: 'bg-green-100 text-green-800', label: 'Verified', description: '2+ guarantors, 3+ rentals' },
  TRUSTED: { color: 'bg-purple-100 text-purple-800', label: 'Trusted', description: '10+ rentals, no disputes' },
};

export default function ProfilePage() {
  const { user } = useAuth(); // Keep this as is
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [trustData, setTrustData] = useState<TrustData | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [guarantors, setGuarantors] = useState<any[]>([]);
  const [formData, setFormData] = useState<ProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: '',
    city: '',
    subcity: '',
    woreda: '',
    kebele: '',
    houseNumber: '',
    occupation: '',
    bio: '',
    profileImage: user?.profileImage || '',
  });

  // Dialog states
  const [isIdDialogOpen, setIsIdDialogOpen] = useState(false);
  const [isGuarantorDialogOpen, setIsGuarantorDialogOpen] = useState(false);
  const [idData, setIdData] = useState({
    idNumber: '',
    idType: 'ID_CARD',
    documentFront: '',
  });
  const [guarantorData, setGuarantorData] = useState({
    guarantorPhone: '',
    relationship: '',
  });

  useEffect(() => {
    fetchProfileData();
    fetchTrustData();
    fetchVerifications();
    fetchGuarantors();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await profileApi.getProfile();
      if (response.success) {
        setFormData(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchTrustData = async () => {
    try {
      const response = await profileApi.getTrustData();
      if (response.success) {
        setTrustData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch trust data:', error);
    }
  };

  const fetchVerifications = async () => {
    try {
      const response = await profileApi.getVerificationStatus();
      if (response.success) {
        setVerifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    }
  };

  const fetchGuarantors = async () => {
    try {
      const response = await profileApi.getGuarantors();
      if (response.success) {
        setGuarantors(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch guarantors:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await profileApi.updateProfile(formData);
      if (response.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await profileApi.uploadProfilePicture(file);
      if (response.success) {
        toast.success('Profile picture updated');
        setFormData(prev => ({ ...prev, profileImage: response.data.url }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleIdVerification = async () => {
    try {
      const response = await profileApi.requestIdVerification(idData);
      if (response.success) {
        toast.success('ID verification submitted');
        setIsIdDialogOpen(false);
        fetchVerifications();
        fetchTrustData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit verification');
    }
  };

  const handleAddGuarantor = async () => {
    try {
      const response = await profileApi.addGuarantor(guarantorData);
      if (response.success) {
        toast.success('Guarantor added successfully');
        setIsGuarantorDialogOpen(false);
        fetchGuarantors();
        fetchTrustData();
        setGuarantorData({ guarantorPhone: '', relationship: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add guarantor');
    }
  };

  const getInitials = () => {
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  };

  const getTrustLevelBadge = () => {
    if (!trustData) return null;
    const level = trustData.level;
    const trustInfo = TRUST_LEVELS[level as keyof typeof TRUST_LEVELS] || TRUST_LEVELS.NEW;
    return (
      <Badge className={trustInfo.color}>
        {trustInfo.label}
      </Badge>
    );
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified 
      ? <CheckCircle className="h-5 w-5 text-green-500" />
      : <XCircle className="h-5 w-5 text-gray-300" />;
  };

  const formatPhone = () => {
    if (!user?.phone) return '';
    if (typeof user.phone === 'object' && user.phone !== null) {
      const phoneObj = user.phone as { formatted?: string; number?: string };
      return phoneObj.formatted || phoneObj.number || '';
    }
    return user.phone;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account and Ethiopian address details</p>
      </div>

      {/* Trust Level Card */}
      {trustData && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Shield className="h-10 w-10 text-primary" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Trust Level</h3>
                    {getTrustLevelBadge()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {TRUST_LEVELS[trustData.level as keyof typeof TRUST_LEVELS]?.description}
                  </p>
                </div>
              </div>
              <div className="w-full md:w-64">
                <div className="flex justify-between text-sm mb-1">
                  <span>Trust Score</span>
                  <span className="font-medium">{trustData.score}%</span>
                </div>
                <Progress value={trustData.score} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Profile Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="address">Ethiopian Address</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>
        
        {/* Personal Info Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {/* Profile Picture */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-primary/20">
                      <AvatarImage src={formData.profileImage || ''} />
                      <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="picture-upload" 
                      className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      <input 
                        id="picture-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Profile Picture</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                    {isUploading && <p className="text-xs text-primary mt-1">Uploading...</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formatPhone()}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">Phone number cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={formData.occupation || ''}
                    onChange={handleChange}
                    placeholder="e.g. Software Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* Ethiopian Address Tab */}
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle>Ethiopian Address</CardTitle>
              <CardDescription>Add your Ethiopian location details for verification and delivery</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Select 
                      value={formData.region || ''} 
                      onValueChange={(value: string) => handleSelectChange('region', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {ETHIOPIAN_REGIONS.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      placeholder="e.g. Addis Ababa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcity">Subcity</Label>
                    <Input
                      id="subcity"
                      name="subcity"
                      value={formData.subcity || ''}
                      onChange={handleChange}
                      placeholder="e.g. Bole, Kirkos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="woreda">Woreda *</Label>
                    <Input
                      id="woreda"
                      name="woreda"
                      value={formData.woreda || ''}
                      onChange={handleChange}
                      placeholder="e.g. 03"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kebele">Kebele</Label>
                    <Input
                      id="kebele"
                      name="kebele"
                      value={formData.kebele || ''}
                      onChange={handleChange}
                      placeholder="e.g. 07"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="houseNumber">House Number</Label>
                    <Input
                      id="houseNumber"
                      name="houseNumber"
                      value={formData.houseNumber || ''}
                      onChange={handleChange}
                      placeholder="e.g. 123"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-blue-800 mb-2">Why add your address?</h4>
                  <p className="text-sm text-blue-600">
                    Your Ethiopian address helps with delivery verification and increases your trust score. 
                    Verified addresses make renters more confident in booking your items.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Address'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>Verify your identity to increase your trust level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verification Progress */}
              {trustData && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Verification Progress</span>
                    <span className="font-medium">
                      {Object.values(trustData.verifications).filter(v => v === true || (typeof v === 'number' && v > 0)).length}/5 verified
                    </span>
                  </div>
                  <Progress 
                    value={(Object.values(trustData.verifications).filter(v => v === true || (typeof v === 'number' && v > 0)).length / 5) * 100} 
                    className="h-2" 
                  />
                </div>
              )}

              {/* Verification Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {trustData?.verifications.phone ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                    <div>
                      <p className="font-medium">Phone Number</p>
                      <p className="text-sm text-muted-foreground">Verified via SMS</p>
                    </div>
                  </div>
                  {trustData?.verifications.phone && (
                    <Badge variant="outline" className="bg-green-50">Verified</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {trustData?.verifications.email ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">Verify your email</p>
                    </div>
                  </div>
                  {!trustData?.verifications.email ? (
                    <Button size="sm" variant="outline">Verify Now</Button>
                  ) : (
                    <Badge variant="outline" className="bg-green-50">Verified</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {trustData?.verifications.id ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                    <div>
                      <p className="font-medium">ID Card</p>
                      <p className="text-sm text-muted-foreground">Ethiopian ID or Passport</p>
                    </div>
                  </div>
                  {!trustData?.verifications.id ? (
                    <Dialog open={isIdDialogOpen} onOpenChange={setIsIdDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload ID Document</DialogTitle>
                          <DialogDescription>
                            Upload your Ethiopian ID, passport, or driving license for verification.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="idType">ID Type</Label>
                            <Select 
                              value={idData.idType} 
                              onValueChange={(value: string) => setIdData({ ...idData, idType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select ID type" />
                              </SelectTrigger>
                              <SelectContent>
                                {ID_TYPES.map(type => (
                                  <SelectItem key={type} value={type}>
                                    {type.replace('_', ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="idNumber">ID Number</Label>
                            <Input
                              id="idNumber"
                              value={idData.idNumber}
                              onChange={(e) => setIdData({ ...idData, idNumber: e.target.value })}
                              placeholder="Enter your ID number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="documentFront">Document Image</Label>
                            <Input
                              id="documentFront"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // In a real app, you'd upload the file first and get a URL
                                  // For now, we'll use a placeholder
                                  setIdData({ ...idData, documentFront: URL.createObjectURL(file) });
                                }
                              }}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsIdDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleIdVerification}>Submit</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Badge variant="outline" className="bg-green-50">Verified</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {trustData?.verifications.address ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">Complete your address</p>
                    </div>
                  </div>
                  {!trustData?.verifications.address ? (
                    <Button size="sm" variant="outline">Add Address</Button>
                  ) : (
                    <Badge variant="outline" className="bg-green-50">Verified</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Guarantors</p>
                      <p className="text-sm text-muted-foreground">
                        {trustData?.verifications.guarantors || 0}/2 guarantors
                      </p>
                    </div>
                  </div>
                  <Dialog open={isGuarantorDialogOpen} onOpenChange={setIsGuarantorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Guarantor
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Guarantor</DialogTitle>
                        <DialogDescription>
                          Add a trusted person who can vouch for you.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="guarantorPhone">Guarantor's Phone</Label>
                          <Input
                            id="guarantorPhone"
                            value={guarantorData.guarantorPhone}
                            onChange={(e) => setGuarantorData({ ...guarantorData, guarantorPhone: e.target.value })}
                            placeholder="+251 91 234 5678"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="relationship">Relationship</Label>
                          <Select 
                            value={guarantorData.relationship} 
                            onValueChange={(value: string) => setGuarantorData({ ...guarantorData, relationship: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Family">Family</SelectItem>
                              <SelectItem value="Friend">Friend</SelectItem>
                              <SelectItem value="Colleague">Colleague</SelectItem>
                              <SelectItem value="Neighbor">Neighbor</SelectItem>
                              <SelectItem value="Relative">Relative</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGuarantorDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddGuarantor}>Add Guarantor</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Guarantors List */}
              {guarantors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-3">Your Guarantors</h4>
                  <div className="space-y-2">
                    {guarantors.map((g) => (
                      <div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{g.guarantor?.firstName} {g.guarantor?.lastName}</p>
                          <p className="text-sm text-muted-foreground">{g.relationship} • {g.status}</p>
                        </div>
                        <Badge variant={g.status === 'CONFIRMED' ? 'default' : 'outline'}>
                          {g.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Level Info */}
              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <h4 className="font-medium mb-2">About Trust Levels</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className={TRUST_LEVELS.NEW.color}>New</Badge>
                    <span className="text-muted-foreground">Phone verification only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={TRUST_LEVELS.BASIC.color}>Basic</Badge>
                    <span className="text-muted-foreground">ID + selfie verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={TRUST_LEVELS.VERIFIED.color}>Verified</Badge>
                    <span className="text-muted-foreground">2+ guarantors, 3+ rentals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={TRUST_LEVELS.TRUSTED.color}>Trusted</Badge>
                    <span className="text-muted-foreground">10+ rentals, no disputes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}