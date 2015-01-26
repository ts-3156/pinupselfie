require 'rails_helper'

RSpec.describe RedirectController, :type => :controller do

  describe "GET to" do
    it "returns http success" do
      get :to
      expect(response).to have_http_status(:success)
    end
  end

end
